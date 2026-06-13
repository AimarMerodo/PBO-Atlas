# Spec común para los agentes de migración (Fase 3)

Migramos una web Next.js/React (en `../src/`) a esta app Angular v21. Tu bloque debe
quedar con **paridad visual y funcional 1:1** con la versión React.

## Reglas obligatorias

- **Signals**: `signal()`, `computed()`, `input()`/`input.required()`, `output()`, `resource()` para datos. NADA de RxJS en componentes nuevos (solo lo que ya use el core).
- **ChangeDetectionStrategy.OnPush** en todos los componentes.
- **Control flow nuevo**: `@if/@for/@switch` (nunca *ngIf/*ngFor). `track` siempre en `@for`.
- **Alias de imports**: `@core/*`, `@shared/*`, `@features/*`, `@layout/*` (configurados en tsconfig).
- **Componentización**: un componente por carpeta. Si la plantilla supera ~15 líneas → archivo `.html` separado (`templateUrl`). CSS: Tailwind en plantilla; NO crear archivos .css salvo necesidad real.
- **Tailwind**: copia las clases EXACTAS del componente React equivalente. El tema (colores `bg-bg`, `bg-surface`, `bg-surface-2`, `border-line`, `text-ink`, `text-ink-dim`, `bg-accent`, `text-accent-soft`) ya está configurado.
- **Clean/DRY/KISS**: reutiliza lo que ya existe (abajo); no dupliques lógica; componentes presentacionales tontos + páginas que cargan datos.

## Infraestructura YA existente (reutilízala, no la reimplementes)

- `@core/i18n/language.service.ts` — `LanguageService`: `lang()` signal, `t(key)` traducción, `pick(record)` para records por idioma, `setLang()`. Diccionarios completos en `@core/i18n/locales/*`.
- `@core/data/data.service.ts` — `DataService` con métodos tipados: `homeCards()`, `region(id)`, `location(region,id)`, `pokemon(slug)`, `pokedexList()`, `searchIndex()`, `natures()`, `items()`, `mounts()`, `cosmetics()`. Todos devuelven Promise; úsalo con `resource()`.
- `@core/models/types.ts` — todos los tipos de dominio.
- `@core/utils/colors.ts` (TYPE_COLORS, RARITY_COLORS, RARITY_ORDER), `@core/utils/type-chart.ts` (defenseProfile), `@core/utils/slug.ts` (slugifyName).
- `@core/contact.ts` — CONTACT, GAME_NAME, GAME_URL.
- Compartidos en `@shared/components/`: `type-badge` (`<app-type-badge [type]="...">`), `rarity-badge`, `time-icon`, `method-icon` (inputs method/note), `item-icon` (icon/size), `game-modal` (title/subtitle/badge/icon inputs, `(closed)` output, contenido proyectado con ng-content), `pager` (current/pageCount/numbered inputs, `(pageChange)` output), `search-dialog`.
- Iconos: `@lucide/angular` v1.18 usa UN COMPONENTE POR ICONO sobre svg: `import { LucideSparkles } from "@lucide/angular"`, añadirlo a `imports: [...]` del componente, y en plantilla `<svg lucideSparkles class="h-3.5 w-3.5" aria-hidden="true"></svg>`. Para icono dinámico usa `@switch` (ver `@shared/components/method-icon`).
- Layout (header/footer/banner/nav) ya hecho — no lo toques.

## Patrón de página con datos

```ts
readonly slug = input.required<string>();          // param de ruta (withComponentInputBinding)
private readonly data = inject(DataService);
protected readonly page = resource({
  params: () => this.slug(),
  loader: ({ params }) => this.data.pokemon(params),
});
```
Template: `@if (page.value(); as p) { ... }`

## Metadata SEO

En cada página, `inject(Title)` y `inject(Meta)` de `@angular/platform-browser` y replica el
title/description de la página React equivalente (en un `effect()` cuando dependa de datos).
Plantilla del título: `<contenido> | PBO Atlas`.

## Verificación de tu bloque

1. `npx ng build` (desde `angular/`) debe pasar sin errores.
2. Levanta `npx ng serve --port 4300` y compara CADA página tuya con la versión React de
   producción (https://pbo-atlas.vercel.app o el código fuente React) — captura con Chrome
   headless si te ayuda: `& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --screenshot=out.png --window-size=1280,900 --virtual-time-budget=15000 <url>`.
3. Comprueba el cambio de idioma (toggle EN/ES/中文/PT) en tus páginas.
4. Los datos vienen de /data/... — el dev server los sirve tras `node tools/sync-public.mjs`.

## Fuentes React de referencia (lee SIEMPRE el original antes de migrar)

- Páginas: `../src/app/**/page.tsx`
- Componentes: `../src/components/**/*.tsx`
- Diccionario de claves i18n: `../src/i18n/locales/en.ts` (las mismas claves existen aquí)
