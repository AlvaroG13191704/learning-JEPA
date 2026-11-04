/** Paleta leída de las variables CSS, para dibujar en <canvas> con los mismos tokens que el resto del sitio. */
const KEYS = [
  'bg', 'surface', 'ink', 'muted', 'line', 'ctx', 'tgt', 'pred', 'ok', 'bad',
  'sky', 'sun', 'grass', 'tree', 'trunk', 'house', 'roof', 'mono',
] as const;
export type PalKey = (typeof KEYS)[number];
export const P = {} as Record<PalKey, string>;

const listeners = new Set<() => void>();

export function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  for (const k of KEYS) P[k] = cs.getPropertyValue('--' + k).trim();
}

/** Llama a `cb` cada vez que cambia el tema (sistema o atributo data-theme). */
export function onThemeChange(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

if (typeof window !== 'undefined') {
  readPalette();
  const fire = () => { readPalette(); listeners.forEach((f) => f()); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', fire);
  new MutationObserver(fire).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

/** '#rrggbb' -> 'rgba(r,g,b,a)' */
export function alpha(c: string, a: number) {
  if (c.startsWith('#')) {
    const n = parseInt(c.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  return c;
}
