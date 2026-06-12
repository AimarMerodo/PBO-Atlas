# Plan de migración: Next.js/React → Angular v21

Objetivo: migrar la web a Angular v21 (stack habitual del mantenedor) sin perder
funcionalidad, SEO (prerender de ~1.700 rutas) ni el pipeline de datos.
La web actual sigue en producción intacta hasta el swap final.

## Qué NO se toca

- `scripts/` completo (scraper del foro, extractor del juego, builders) — Node puro
- `src/data/*.json` y todos los assets de `public/` (sprites, atlas, mapas, arte)
- El repo de GitHub y el proyecto de Vercel (solo cambia el framework detectado al final)

## Decisiones técnicas

| Tema | Decisión |
|---|---|
| Versión | Angular v21, standalone components, zoneless, signals, control flow `@if/@for` |
| Estilos | Tailwind v4 (mismas clases; copiar `globals.css` → `styles.css`) |
| SSG | `outputMode: 'static'` + render mode `Prerender` por ruta con `getPrerenderParams` (pokedex/:slug, region/:region, region/:region/:location) |
| Datos por página | Nuevo `scripts/build-page-data.mjs`: trocea los JSON grandes en archivos por entidad bajo `public/data/` para que cada página cargue solo lo suyo (~5-30 KB) |
| i18n | Los 4 diccionarios (`locales/{en,es,zh,pt}.ts`) se portan tal cual; `LanguageService` con signal + localStorage; pipe/función `t()` |
| Estado UI | Signals locales por componente (filtros, paginación, modales) — sin NgRx |
| Imágenes | `<img>` normal (ya usamos unoptimized en casi todo) + `NgOptimizedImage` donde aporte |
| Deploy | Salida estática (`dist/browser`) → Vercel sin runtime de servidor |

## Estructura durante la migración

- Rama `angular-migration`; app nueva en `angular/` dentro del repo
- Al finalizar (Fase 5): swap a raíz, se eliminan `src/app` React, `next.config.ts` y deps de Next; tag `pre-angular` como rollback

## Fases

### Fase 0 — Prueba de concepto (GATE: si falla, abortamos sin coste)
1. `ng new` (v21, standalone, zoneless) en `angular/` + Tailwind v4
2. Ruta dinámica de prueba `/pokedex/:slug` con `getPrerenderParams` devolviendo los 1.329 slugs, leyendo el JSON troceado
3. Build estático completo (~1.700 rutas) midiendo tiempo; preview deploy en Vercel
4. **Criterio de paso**: build < 15 min, HTML prerenderizado con contenido (SEO ok), preview funcional

### Fase 1 — Troceo de datos
`scripts/build-page-data.mjs` genera:
- `public/data/pokemon/<slug>.json` — entrada de pokedex + habilidades resueltas + learnset con movimientos + encuentros ("dónde conseguirlo")
- `public/data/locations/<region>/<id>.json` — spawns con sprites resueltos
- `public/data/regions/<region>.json` — lista de localizaciones + mapa + previews de marcadores
- `public/data/lists/{pokedex,search,natures}.json` — índices ligeros
- items/mounts/cosmetics ya son carga perezosa: se mueven a `public/data/` tal cual

### Fase 2 — Esqueleto
- Rutas, layout (Header, NavMore, SearchDialog Ctrl+K, LanguageToggle, FeedbackBanner, SiteFooter)
- `LanguageService` + diccionarios portados; `TitleStrategy` para metadata por ruta
- Tema oscuro (variables CSS de `globals.css`), `colors.ts` y `type-chart.ts` portados tal cual (TS puro)

### Fase 3 — Migración de páginas (3 agentes en paralelo, 1 por bloque)
| Bloque | Contenido | Componentes React de referencia |
|---|---|---|
| A — Regiones | home (hero + tarjetas), región (mapa interactivo + lista), localización (tabla spawns + filtros) | page.tsx, RegionMap, MapMarker, LocationList, SpawnTable, RarityBadge, TimeIcon, MethodIcon |
| B — Pokedex | lista (buscador grande, 6 filtros, paginación numerada), detalle (artwork animado + shiny, stats, debilidades, habilidades, evoluciones, dónde conseguirlo, movimientos) | PokedexExplorer, PokemonArtwork, StatBars, TypeEffectiveness, AbilityList, EvolutionLine, CatchLocations, MovesSection |
| C — Juego | items/monturas/cosméticos (cuadrícula + modales + deep links), naturalezas, feedback | ItemsExplorer, MountsExplorer, CosmeticsExplorer, GameModal, ItemIcon, NaturesTable, CopyButton |

Regla para los agentes: paridad visual y funcional 1:1 con la versión React (mismas clases Tailwind), verificación con captura por página contra producción.

### Fase 4 — Prerender + SEO
- `getPrerenderParams` en las 3 rutas dinámicas; metadata (Title/Meta) equivalente a la actual
- Comprobar que el HTML estático contiene el contenido (no solo el shell)

### Fase 5 — Verificación y swap
1. Checklist de paridad página a página (capturas lado a lado) + flujos: búsqueda Ctrl+K, toggle shiny, filtros, deep links de modales, cambio de idioma persistente
2. Build de producción + Lighthouse básico
3. Tag `pre-angular` en main → merge de la rama → mover Angular a raíz → eliminar restos de Next → push (Vercel redetecta Angular)
4. Smoke test en producción

## Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Prerender de 1.7k rutas lento/roto en Vercel | Fase 0 lo valida antes de invertir nada |
| Mapa interactivo (coordenadas %, popovers) | Migración manual cuidadosa (no agente), captura comparada multi-ancho |
| Flash de idioma (localStorage en cliente) | Mismo comportamiento que hoy; aceptado |
| Regresión silenciosa en alguna página | Checklist con capturas página a página antes del swap |
| Algo sale mal post-swap | Tag `pre-angular` → revert en 1 minuto |

## Estimación

- Fase 0: corta (es el gate; si falla, no se sigue)
- Fases 1-2: una sesión de trabajo
- Fase 3: el grueso — 3 agentes en paralelo + revisión
- Fases 4-5: verificación metódica
- Total: 1-2 sesiones largas, con la web actual en producción todo el tiempo
