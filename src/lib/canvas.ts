import { onThemeChange } from './palette';

export const reduceMotion =
  typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export type Ctx = CanvasRenderingContext2D;
export interface Sized { w: number; h: number }

/** Prepara un canvas con tamaño lógico w×h y nitidez para pantallas de alta densidad. */
export function setupCanvas(cv: HTMLCanvasElement, w: number, h: number): Ctx {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  cv.width = w * dpr;
  cv.height = h * dpr;
  cv.style.width = w + 'px';
  const ctx = cv.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  (cv as HTMLCanvasElement & { _size: Sized })._size = { w, h };
  return ctx;
}

/** Coordenadas lógicas de un evento de puntero sobre el canvas (aunque CSS lo escale). */
export function pointerPos(cv: HTMLCanvasElement, e: MouseEvent): [number, number] {
  const r = cv.getBoundingClientRect();
  const { w, h } = (cv as HTMLCanvasElement & { _size: Sized })._size;
  return [((e.clientX - r.left) * w) / r.width, ((e.clientY - r.top) * h) / r.height];
}

export const rnd = (a: number, b: number) => a + Math.random() * (b - a);
export function gauss() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ---- Un único bucle de animación; cada demo solo corre mientras está en pantalla ---- */
interface Demo { el: Element; tick?: (dt: number, t: number) => void; draw?: () => void; visible: boolean }
const demos = new Set<Demo>();
let io: IntersectionObserver | null = null;
let started = false;
let last = 0;

function frame(t: number) {
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  for (const d of demos) if (d.visible && d.tick) d.tick(dt, t / 1000);
  requestAnimationFrame(frame);
}

/** Registra una demo: `tick` se llama en cada frame visible, `draw` al cambiar el tema. Devuelve la función de limpieza. */
export function registerDemo(el: Element, tick?: Demo['tick'], draw?: Demo['draw']) {
  io ??= new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      for (const d of demos) if (d.el === e.target) d.visible = e.isIntersecting;
    }),
    { rootMargin: '100px' },
  );
  if (!started) { started = true; last = performance.now(); requestAnimationFrame(frame); }
  const d: Demo = { el, tick, draw, visible: false };
  demos.add(d);
  io.observe(el);
  const off = draw ? onThemeChange(draw) : () => {};
  return () => { demos.delete(d); io?.unobserve(el); off(); };
}
