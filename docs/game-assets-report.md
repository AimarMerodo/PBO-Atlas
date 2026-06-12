# Informe de assets de Pokemon Blaze Online

Escaneo de `Desktop\cosas\pbo-windows` (cliente del juego). Los devs han dado permiso para usar los assets.
Fuentes: carpeta `assets/` del cliente y datos embebidos en `pbo.jar` (un .jar es un zip).

## La base de datos del juego (dentro de `pbo.jar`)

| Archivo | Contenido | Para qué sirve |
|---|---|---|
| `pokedex/pokemondata.json` (5,2 MB) | **La pokedex del juego**: stats, tipos, y los **learnsets exactos in-game** (por nivel, huevo, tutor, MT) de cada pokemon | Sustituir los movimientos "orientativos de Gen 9" por los reales de PBO → quitar el aviso de "puede haber diferencias" |
| `pokedex/abilities_text.json` | **Los textos exactos de habilidades in-game** (desc larga + corta, keyed por slug) | Descripciones de habilidades idénticas al juego |
| `pokedex/translated_moves.csv` (250 KB) | Nombres **y descripciones** de movimientos traducidos oficialmente por PBO a chino, español, alemán y portugués | Descripciones de movimientos en los 4 idiomas de la web |
| `pokedex/ev_yield.csv` | EVs que da cada pokemon (PBO_ID, NAME, columnas por stat) | Validar/sustituir los EVs scrapeados del foro |
| `nature/nature_list.csv` + `nature_es/pt/zh/de.csv` | Las 25 naturalezas (stat que sube, stat que baja) traducidas | Sección de naturalezas con datos reales del juego |
| `pokedex/megas.csv` | Megas disponibles | Detalles de formas |
| `pokedex/evo_moves.csv`, `trade_evolution_data.csv`, `pre_evolution_moves.json` | Movimientos de evolución, evoluciones por intercambio | Afinar evoluciones/learnsets |
| `pokedex/gen_8_removed_moves.csv` | Movimientos eliminados en gen 8 | Filtrado de learnsets |
| `pokedex/pokemon_flavor.csv` (134 KB) | Textos de pokedex (flavor) por pokemon | Descripción de pokedex en la ficha |
| `pokedex/showdown/showdown_data.json` (9,5 MB) + `gen7/8/9moves.json` | Datos estilo Showdown que usa el juego (movimientos con efectos) | Fuente alternativa de datos de movimientos |
| `item/items.csv` (514 KB) + `i18n/items_es/pt/zh/de.csv` | Todos los objetos del juego con traducciones | Nueva sección: dex de objetos |
| `chest/surprise/*.json` (~160) | **Contenido exacto de cada cofre**: Alpha Chests por tipo, cofres de temporada (bronce/plata/oro), boxes | Página "qué trae cada cofre" — contenido único |
| `chest/bundle/*.json` (~90) | Bundles de trajes/cosméticos de la tienda | Galería de cosméticos |
| `machines/gen_9_tm_map.csv` (+gen7/8/hm) | Número de MT ↔ movimiento | Mostrar "MT027" junto al movimiento |
| `quests/trackable_quests*.csv` (es/pt/zh/de) | Misiones con traducciones | Guía de misiones |
| `achievements/achievements.csv` (73 KB) | Logros | Sección de logros |
| `item/mounts.csv` (34 KB) + `mount_box.csv` | Monturas | Galería de monturas |
| `maps/maps.csv` (92 KB) | id, nombre, música, ?, x, y, visible, región — coordenadas en el mapa mundial | ✅ Ya usado para los marcadores del mapa |
| `expeditions/*`, `fishing/fishing_milestones.csv`, `pass/*`, `crew/*` | Expediciones, pesca, pase de batalla, crews | Secciones futuras |
| `i18n/abilities_es/pt/zh.csv` | Nombres de habilidades traducidos por PBO | Contrastar con nuestros nombres |
| `i18n/name_es/pt/zh.csv` | Más traducciones de nombres | Revisar contenido |

## Assets gráficos y sonido (carpeta `assets/`)

| Carpeta | Contenido | Interés |
|---|---|---|
| `pokemon-sprites/` (7.532 png) | Sprites del juego: front (2.155), back (2.096), front-shiny (1.648), back-shiny (1.636) — incluye formas y trajes custom de PBO (p. ej. `abomasnowc.png`) | Usar los sprites del propio juego en la web; cubren formas que no existen fuera de PBO |
| `ui/world-map/` | Los 4 mapas de región (750×450) | ✅ Ya usados |
| `login/` (66 png, 21 MB) | Artworks de las pantallas de login (ilustraciones grandes) + fuentes ttf | Fondos hero para la home |
| `mugshots/` (365 png) | Retratos de entrenadores/NPCs (por id numérico) | Decoración, futura guía de gimnasios |
| `ui/item/` | Iconos de objetos en atlas (`item_icons_4x.png` + `.atlas`) | Trocear para la dex de objetos |
| `ui/pokemon/` | Atlas de iconos front de pokemon (`pokemon-front-icons*.png`) | Iconos compactos para listas |
| `chest/` (12 png) | Cofres bronce/plata/oro/platino, abiertos y cerrados | Página de cofres |
| `sound/` (899 mp3 + 26 wav) | Música de cada mapa (maps.csv referencia el mp3 por zona) y efectos | Botón "escuchar la música de esta ruta" |
| `ui/battle/` | Fondos/frames de combate (png numerados) | Decoración |
| `ui/emoji`, `ui/mood`, `ui/doors`, `ui/achievements`, `ui/game-pass` | Emojis del chat, iconos de estado, puertas, logros | Menor |
| `worldboss/` (116, atlas por id) | Sprites/atlas de jefes mundiales | Sección de eventos |
| `mining/` (35 png) | Assets de la minería (update junio 2026) | Guía de minería |
| `move_animations/` (2.131: wav/png/ogg) | Animaciones y sonidos de ataques | Futurible |
| `maps/*.blaze` (1.504) + `*.npc` (6.061) + tilesets | Tilemaps propietarios y NPCs por mapa | Reverse-engineering pesado; podría dar mapas de ruta detallados y localización de NPCs |
| `animated_sprites/*.csv`, `dailyactivities/`, `editor/`, `particles/`, `shaders/` | Datos menores del motor | Sin interés directo |
| `i18n/*.properties` (120) | Textos de la UI del juego en en/es/pt/zh/de | Referencia de terminología |
| `changelogs/*.txt` | Changelogs del juego | Referencia |

## Recomendación por orden de impacto

1. **Migrar movimientos a `pokemondata.json`** + descripciones de `translated_moves.csv` (4 idiomas) → datos exactos de PBO, quitar disclaimer
2. **Habilidades desde `abilities_text.json`** → texto idéntico al juego
3. **Sprites del juego** en pokedex/tablas (identidad PBO + formas custom)
4. **Naturalezas** (`nature_list.csv` + traducciones) y **EVs oficiales** (`ev_yield.csv`)
5. **Página de cofres** (`chest/surprise/*.json` + imágenes de cofres)
6. **Dex de objetos** (`items.csv` + atlas de iconos)
7. **Música por localización** (sound/ + columna música de maps.csv) y artworks de login como fondos
