import { P, alpha } from './palette';
import type { Ctx } from './canvas';

/** La escena de ejemplo (cielo, sol, árbol, casa, pasto) y su "verdad semántica" por píxel. */
export const CATS = ['cielo', 'sol', 'árbol', 'casa', 'pasto'] as const;

/** Categoría del punto (x, y) en una escena de lado W (dibujada a escala de 320). */
export function semAt(x: number, y: number, W: number): number {
  const S = W / 320;
  x /= S; y /= S;
  if ((x - 250) ** 2 + (y - 60) ** 2 < 30 * 30) return 1;
  if ((x - 68) ** 2 + (y - 128) ** 2 < 40 * 40) return 2;
  if (x >= 60 && x <= 78 && y >= 150 && y <= 222) return 2;
  if (x >= 160 && x <= 250 && y >= 150 && y <= 232) return 3;
  if (y >= 105 && y < 150) {
    const half = ((y - 105) / 45) * 55;
    if (x >= 205 - half && x <= 205 + half) return 3;
  }
  if (y > 196 + 9 * Math.sin(x / 38)) return 4;
  return 0;
}

export function drawScene(ctx: Ctx, W: number) {
  const S = W / 320;
  ctx.save();
  ctx.scale(S, S);
  ctx.fillStyle = P.sky; ctx.fillRect(0, 0, 320, 320);
  ctx.fillStyle = P.sun; ctx.beginPath(); ctx.arc(250, 60, 30, 0, 7); ctx.fill();
  ctx.fillStyle = P.grass; ctx.beginPath(); ctx.moveTo(0, 320);
  for (let x = 0; x <= 320; x += 4) ctx.lineTo(x, 196 + 9 * Math.sin(x / 38));
  ctx.lineTo(320, 320); ctx.fill();
  ctx.fillStyle = P.trunk; ctx.fillRect(60, 150, 18, 72);
  ctx.fillStyle = P.tree; ctx.beginPath(); ctx.arc(68, 128, 40, 0, 7); ctx.fill();
  ctx.fillStyle = P.house; ctx.fillRect(160, 150, 90, 82);
  ctx.fillStyle = P.roof; ctx.beginPath(); ctx.moveTo(150, 150); ctx.lineTo(205, 105); ctx.lineTo(260, 150); ctx.fill();
  ctx.fillStyle = alpha(P.sky, 0.9); ctx.fillRect(176, 168, 20, 20); ctx.fillRect(214, 168, 20, 20);
  ctx.fillStyle = P.roof; ctx.fillRect(196, 196, 18, 36);
  ctx.restore();
}

/** Fracción de cada categoría dentro del parche (gx, gy) de una cuadrícula G×G. */
export function patchConcepts(gx: number, gy: number, G: number, W: number) {
  const cs = W / G, v = [0, 0, 0, 0, 0];
  let n = 0;
  for (let y = gy * cs + 2; y < (gy + 1) * cs; y += 4)
    for (let x = gx * cs + 2; x < (gx + 1) * cs; x += 4) { v[semAt(x, y, W)]++; n++; }
  return v.map((c) => c / n);
}
