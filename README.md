# learning-JEPA

Proyecto para aprender la arquitectura JEPA (Joint-Embedding Predictive Architecture) y sus papers derivados, construyendo.

## Atlas JEPA (web)

Una guía narrativa e interactiva, en español, de los 11 papers de la ruta de lectura, con una animación paso a paso del funcionamiento interno de un JEPA, 8 capítulos de fundamentos (vectores y normas L1/L2, gradiente, gaussiana, entropía/cross-entropy/KL, Cross-Entropy Method, Transformers/ViT, SSL contrastivo vs predictivo y colapso). Cierra con una guía para investigar por tu cuenta (proyectos por nivel de cómputo, preguntas abiertas y método). Cada capítulo trae la idea en una frase, la historia con ejemplos, una demo animada, los puntos clave, la matemática mínima y una sección "Más a fondo".

Stack: **Svelte 5** (runes) + **Vite** + **Tailwind CSS 4** + TypeScript, con **pnpm**.

```bash
pnpm install
pnpm dev       # servidor de desarrollo
pnpm build     # genera dist/ (rutas relativas: se puede abrir o servir desde cualquier carpeta)
pnpm preview   # sirve dist/
pnpm check     # svelte-check + TypeScript
```

Versión publicada: https://claude.ai/artifact/Wne8LfUUxXFWt2hEtQDocU

### Estructura

```
src/
  App.svelte          # portada, índice y orden de capítulos
  app.css             # tokens de color (claro/oscuro) expuestos a Tailwind con @theme
  lib/
    Chapter.svelte    # plantilla de capítulo (frase, historia, demo, puntos clave, matemática, más a fondo)
    Rail.svelte       # riel cronológico + barra de progreso
    chapters.ts       # índice de capítulos
    palette.ts        # lee los tokens CSS para dibujar en <canvas>
    canvas.ts         # canvas nítido, bucle de animación compartido (solo corre lo visible)
    scene.ts          # escena de ejemplo y su "verdad semántica"
  chapters/           # Dentro (animación) · F0–F8: fundamentos · P0–P10: un componente por paper · Investiga
  demos/              # una demo interactiva por capítulo
```

Código de color en todo el sitio: azul = contexto (lo visible), ámbar = objetivo (lo oculto), violeta = predicción.

## Ruta de lectura

| # | Paper | Año | Fase |
|---|-------|-----|------|
| 0 | BYOL y VICReg (contexto) | 2020–2021 | 1 |
| 1 | LeCun, *A Path Towards Autonomous Machine Intelligence* | 2022 | Lectura |
| 2 | I-JEPA | 2023 | 1–2 |
| 3 | MC-JEPA | 2023 | 4 |
| 4 | A-JEPA | 2023 | 3 |
| 5 | V-JEPA | 2024 | 4 |
| 6 | V-JEPA 2 y V-JEPA 2-AC | 2025 | 5 |
| 7 | LLM-JEPA | 2025 | 6 |
| 8 | LeJEPA | 2025 | 2 |
| 9 | Proving and Improving the Platonic Representation Hypothesis with JEPAs | 2026 | 6 |
| 10 | Counterfactual World Models: JEPAs That Reason About "What If" | 2026 | 5 |

## Fases del proyecto práctico

1. Mini I-JEPA en CIFAR-10 (ViT-Tiny, EMA, máscaras multi-bloque).
2. Anti-colapso comparado: EMA vs VICReg vs SIGReg (LeJEPA).
3. Audio (A-JEPA).
4. Video (V-JEPA, MC-JEPA).
5. Modelo del mundo con acciones (V-JEPA 2-AC).
6. Texto (LLM-JEPA y buenas vs malas vistas).

Plan completo: https://claude.ai/artifact/FEpNZnjSirKZZiTvZGEUEG

## Despliegue en Cloudflare

La web es estática (Vite genera `dist/`) y se despliega como un Worker con *static assets* (config en `wrangler.jsonc`).

- **Automático (recomendado):** en Cloudflare → Workers & Pages → Create → Import a repository, elige este repo. Build command: `pnpm build`. Deploy command: `npx wrangler deploy`. Cada push a `main` despliega.
- **Manual:** `pnpm wrangler login` y luego `pnpm cf:deploy`. Para probar en local con el runtime de Cloudflare: `pnpm cf:preview`.
