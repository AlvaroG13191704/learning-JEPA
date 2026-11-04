/** Índice de la guía: alimenta el riel lateral y la tabla de contenidos. */
export const chapters = [
  { id: 'idea', tag: 'idea', rail: 'La idea en 1 minuto' },
  { id: 'p0', tag: '2020', rail: 'BYOL y VICReg', toc: '0 · 2020–21 · contexto', title: 'BYOL y VICReg: cómo no colapsar' },
  { id: 'p1', tag: '2022', rail: 'El camino de LeCun', toc: '1 · 2022', title: 'LeCun: el plano del modelo del mundo' },
  { id: 'p2', tag: '2023', rail: 'I-JEPA', toc: '2 · 2023', title: 'I-JEPA: imágenes' },
  { id: 'p3', tag: '2023', rail: 'MC-JEPA', toc: '3 · 2023', title: 'MC-JEPA: movimiento + contenido' },
  { id: 'p4', tag: '2023', rail: 'A-JEPA', toc: '4 · 2023', title: 'A-JEPA: audio' },
  { id: 'p5', tag: '2024', rail: 'V-JEPA', toc: '5 · 2024', title: 'V-JEPA: video' },
  { id: 'p6', tag: '2025', rail: 'V-JEPA 2', toc: '6 · 2025', title: 'V-JEPA 2: planificar con robots' },
  { id: 'p7', tag: '2025', rail: 'LLM-JEPA', toc: '7 · 2025', title: 'LLM-JEPA: texto y código' },
  { id: 'p8', tag: '2025', rail: 'LeJEPA', toc: '8 · 2025', title: 'LeJEPA: sin trucos' },
  { id: 'p9', tag: '2026', rail: 'Hipótesis platónica', toc: '9 · 2026', title: 'Todos los modelos ven lo mismo' },
  { id: 'mapa', tag: 'fin', rail: 'Del paper al código' },
] as const;
