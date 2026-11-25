<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, registerDemo, reduceMotion } from '../lib/canvas';
  import { drawScene, patchConcepts, CATS } from '../lib/scene';
  import Chips from '../lib/Chips.svelte';

  /*
    Animación paso a paso de UNA iteración de entrenamiento de un JEPA estilo I-JEPA.
    Las "representaciones" son vectores de 5 números: la fracción de cielo, sol, árbol, casa y pasto de cada parche
    (la verdad semántica de la escena). Es una simplificación didáctica: un encoder real produce vectores de cientos de dimensiones.
  */
  const W = 880, H = 430, G = 4, IMG = 200, IX = 20, IY = 120, cs = IMG / G;
  const N = G * G;
  const STEPS = [
    { t: 'Parchear', code: 0, d: 'La imagen se corta en una cuadrícula de parches (aquí 4 × 4 = 16; en I-JEPA con ViT-H/14 a 224 px son 16 × 16 = 256). Cada parche será un token.' },
    { t: 'Enmascarar', code: 1, d: 'Se elige un bloque objetivo (ámbar) que la red tendrá que adivinar. El resto es el contexto (azul): lo único que verá el encoder de contexto.' },
    { t: 'Encoder de contexto f_θ', code: 2, d: 'Solo los parches de contexto entran al encoder de contexto (un ViT). Sale un vector por parche visible. Los parches objetivo nunca pasan por aquí.' },
    { t: 'Encoder objetivo f_θ̄ (EMA)', code: 3, d: 'El encoder objetivo ve la imagen completa y produce un vector por parche. Nos quedamos con los del bloque objetivo: esa es la "respuesta correcta". Corre sin gradiente (stop-grad).' },
    { t: 'Predictor g_φ', code: 4, d: 'El predictor recibe los vectores de contexto más un token de máscara por cada parche objetivo, marcado con su posición. Para cada posición predice el vector que debería haber ahí.' },
    { t: 'Pérdida en el espacio latente', code: 5, d: 'Se compara cada predicción (violeta) con su vector objetivo (ámbar), número a número. La pérdida es la distancia media al cuadrado. Nunca se reconstruye un píxel.' },
    { t: 'Retropropagación', code: 6, d: 'El gradiente de la pérdida actualiza el predictor φ y el encoder de contexto θ. Al encoder objetivo no le llega nada: está detrás del stop-grad.' },
    { t: 'Actualización EMA', code: 7, d: 'El encoder objetivo se mueve despacio hacia el de contexto: sus pesos son una media móvil exponencial. Así el objetivo cambia más lento que quien intenta alcanzarlo.' },
  ];
  const CODE = [
    'x = patchify(img)                        # 16 parches',
    'ctx_idx, tgt_idx = sample_masks()',
    'z = f_θ(x[ctx_idx])                      # encoder de contexto',
    'with torch.no_grad():  s = f_θ̄(x)[tgt_idx]   # encoder objetivo',
    'ŝ = g_φ(z, mask_tokens(pos=tgt_idx))     # predictor',
    'loss = ((ŝ - s) ** 2).mean()             # espacio latente',
    'loss.backward(); opt.step()              # actualiza θ y φ',
    'θ̄ = τ·θ̄ + (1 - τ)·θ                      # EMA, sin gradiente',
  ];

  let step = $state(0);
  let playing = $state(!reduceMotion);
  let iter = $state(1);
  let mode = $state<'ok' | 'broken'>('ok');
  let tau = $state(0.9);
  let lossNow = $state(0);
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let p = reduceMotion ? 1 : 0; // progreso dentro del paso (0..1)
  let draw = () => {};

  // Estado de la iteración
  let tgt: number[] = [];
  const truth = Array.from({ length: N }, (_, i) => patchConcepts(i % G, Math.floor(i / G), G, 320));
  const wCtx = [0.3, 0.7, 0.45, 0.6, 0.25, 0.55];
  let wTgt = [0.6, 0.35, 0.7, 0.3, 0.55, 0.4];
  let wCtxStart = [...wCtx];
  let wTgtStart = [...wTgt];

  const isTgt = (i: number) => tgt.includes(i);
  const ctxIdx = () => Array.from({ length: N }, (_, i) => i).filter((i) => !isTgt(i));

  /** Error del predictor: baja con las iteraciones. En modo roto, todo converge a un vector constante (colapso). */
  const predErr = () => Math.max(0.06, 0.75 * Math.exp(-(iter - 1) / 4));
  const collapse = () => (mode === 'broken' ? 1 - Math.exp(-(iter - 1) / 2.2) : 0);
  const CONST = [0.2, 0.2, 0.2, 0.2, 0.2];
  function enc(i: number) {
    const c = collapse();
    return truth[i].map((v, k) => v * (1 - c) + CONST[k] * c);
  }
  function pred(j: number) {
    const i = tgt[j], s = enc(i), ci = ctxIdx();
    const mean = [0, 0, 0, 0, 0];
    ci.forEach((q) => enc(q).forEach((v, k) => (mean[k] += v / ci.length)));
    const e = mode === 'broken' ? predErr() * (1 - collapse()) : predErr();
    return s.map((v, k) => v * (1 - e) + mean[k] * e);
  }
  function computeLoss() {
    let L = 0;
    tgt.forEach((i, j) => { const a = pred(j), b = enc(i); a.forEach((v, k) => (L += (v - b[k]) ** 2)); });
    return L / (tgt.length * 5);
  }
  function newMask() {
    const gx = Math.floor(Math.random() * (G - 1)), gy = Math.floor(Math.random() * (G - 1));
    tgt = [gy * G + gx, gy * G + gx + 1, (gy + 1) * G + gx, (gy + 1) * G + gx + 1];
    lossNow = computeLoss();
  }
  newMask();

  function go(s: number) {
    if (s >= STEPS.length) { // nueva iteración
      iter++; newMask(); s = 0;
      wCtxStart = [...wCtx]; wTgtStart = [...wTgt];
    }
    if (s === 6) { wCtxStart = [...wCtx]; }
    if (s === 7) { wTgtStart = [...wTgt]; }
    step = Math.max(0, s); p = reduceMotion ? 1 : 0;
    applyWeights();
    draw();
  }
  let ctxTarget = [...wCtx];
  function applyWeights() {
    if (step === 6) {
      // el gradiente mueve los pesos de contexto a un sitio nuevo
      ctxTarget = wCtxStart.map((w) => Math.min(0.95, Math.max(0.08, w + (Math.random() - 0.5) * 0.5)));
    }
  }
  function reset() { iter = 1; newMask(); step = 0; p = reduceMotion ? 1 : 0; draw(); }
  $effect(() => { mode; untrack(reset); });
  $effect(() => { tau; draw(); });

  const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  /** Progreso escalonado del elemento k de n (para que las cosas salgan una tras otra). */
  const stag = (k: number, n: number, t: number, spread = 0.55) => clamp01((t - (k / Math.max(1, n)) * spread) / (1 - spread));

  onMount(() => {
    const ctx = setupCanvas(cv, W, H);
    const off = document.createElement('canvas'); off.width = IMG * 2; off.height = IMG * 2;
    const octx = off.getContext('2d')!; octx.scale(2, 2);

    const BOX = {
      ctx: { x: 244, y: 40, w: 146, h: 96 },
      tgt: { x: 244, y: 300, w: 146, h: 96 },
      pred: { x: 600, y: 40, w: 112, h: 96 },
    };
    const patchXY = (i: number) => [IX + (i % G) * cs, IY + Math.floor(i / G) * cs];

    function strip(x: number, y: number, v: number[], col: string, a = 1, w = 10, hh = 46) {
      const ch = hh / 5;
      ctx.globalAlpha = a;
      v.forEach((val, k) => {
        ctx.fillStyle = alpha(col, 0.12 + 0.88 * clamp01(val));
        ctx.fillRect(x, y + k * ch, w, ch - 1);
      });
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeRect(x - 0.5, y - 0.5, w + 1, hh);
      ctx.globalAlpha = 1;
    }
    function box(b: { x: number; y: number; w: number; h: number }, col: string, title: string, sub: string, glow: number, weights: number[]) {
      ctx.fillStyle = alpha(col, 0.06 + 0.16 * glow); ctx.strokeStyle = col; ctx.lineWidth = 1.5 + glow * 1.5;
      ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = P.ink; ctx.font = '700 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(title, b.x + b.w / 2, b.y + 8);
      ctx.fillStyle = P.muted; ctx.font = '11px sans-serif'; ctx.fillText(sub, b.x + b.w / 2, b.y + 25);
      // pesos: barras pequeñas
      const bw = 10, gap = 6, tot = weights.length * bw + (weights.length - 1) * gap, x0 = b.x + (b.w - tot) / 2, base = b.y + b.h - 10;
      weights.forEach((w, k) => {
        ctx.fillStyle = alpha(col, 0.75); ctx.fillRect(x0 + k * (bw + gap), base - w * 36, bw, w * 36);
      });
      ctx.strokeStyle = alpha(P.ink, 0.2); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 - 3, base + 0.5); ctx.lineTo(x0 + tot + 3, base + 0.5); ctx.stroke();
    }
    function arrow(x1: number, y1: number, x2: number, y2: number, col: string, a = 1, dash: number[] = []) {
      ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
      const ang = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 8 * Math.cos(ang - 0.4), y2 - 8 * Math.sin(ang - 0.4)); ctx.lineTo(x2 - 8 * Math.cos(ang + 0.4), y2 - 8 * Math.sin(ang + 0.4)); ctx.fill();
      ctx.globalAlpha = 1;
    }
    function lock(x: number, y: number) {
      ctx.strokeStyle = P.tgt; ctx.fillStyle = P.tgt; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(x, y - 4, 5, Math.PI, 0); ctx.stroke(); ctx.fillRect(x - 7, y - 4, 14, 10);
    }

    draw = () => {
      const e = ease(p);
      ctx.fillStyle = P.surface; ctx.fillRect(0, 0, W, H);
      ctx.textBaseline = 'alphabetic';

      // ---- Imagen y máscara ----
      drawScene(octx, IMG);
      ctx.drawImage(off, IX, IY, IMG, IMG);
      const gridA = step === 0 ? e : 1;
      ctx.strokeStyle = alpha(P.ink, 0.5 * gridA); ctx.lineWidth = 1;
      for (let k = 1; k < G; k++) {
        ctx.beginPath(); ctx.moveTo(IX + k * cs, IY); ctx.lineTo(IX + k * cs, IY + IMG); ctx.moveTo(IX, IY + k * cs); ctx.lineTo(IX + IMG, IY + k * cs); ctx.stroke();
      }
      if (step === 0) {
        ctx.font = '10px monospace'; ctx.fillStyle = alpha(P.ink, e); ctx.textAlign = 'left';
        for (let i = 0; i < N; i++) { const [x, y] = patchXY(i); ctx.fillText(String(i), x + 3, y + 11); }
      }
      if (step >= 1) {
        const mA = step === 1 ? e : 1;
        for (let i = 0; i < N; i++) {
          const [x, y] = patchXY(i);
          if (isTgt(i)) { ctx.fillStyle = alpha(P.tgt, 0.55 * mA); ctx.fillRect(x, y, cs, cs); }
          else { ctx.fillStyle = alpha(P.ctx, 0.14 * mA); ctx.fillRect(x, y, cs, cs); }
        }
        const t0 = patchXY(tgt[0]);
        ctx.strokeStyle = alpha(P.tgt, mA); ctx.lineWidth = 3; ctx.strokeRect(t0[0] + 1.5, t0[1] + 1.5, 2 * cs - 3, 2 * cs - 3);
      }
      ctx.fillStyle = P.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('imagen → 16 parches', IX, IY - 10);

      // ---- Cajas ----
      const ewOk = mode === 'ok';
      box(BOX.ctx, P.ctx, 'Encoder de contexto', 'f_θ · ViT', step === 2 ? 1 - Math.abs(e - 0.5) * 2 : step === 6 ? 0.6 : 0, wCtx);
      box(BOX.tgt, P.tgt, 'Encoder objetivo', ewOk ? 'f_θ̄ · EMA de f_θ' : 'f_θ (mismos pesos)', step === 3 ? 1 - Math.abs(e - 0.5) * 2 : step === 7 ? 0.6 : 0, ewOk ? wTgt : wCtx);
      box(BOX.pred, P.pred, 'Predictor', 'g_φ · ViT estrecho', step === 4 ? 1 - Math.abs(e - 0.5) * 2 : step === 6 ? 0.6 : 0, [0.5, 0.65, 0.4, 0.7]);
      if (ewOk) lock(BOX.tgt.x + BOX.tgt.w - 4, BOX.tgt.y - 2);

      // ---- Paso 2: contexto vuela al encoder y salen vectores ----
      const ci = ctxIdx();
      const CX0 = 400, CY = 66;
      if (step >= 2) {
        const flyT = step === 2 ? clamp01(e * 1.8) : 1;
        if (step === 2 && flyT < 1) {
          ci.forEach((i, k) => {
            const t = ease(stag(k, ci.length, flyT));
            const [x, y] = patchXY(i);
            const tx = BOX.ctx.x + 30, ty = BOX.ctx.y + 40;
            const s = lerp(cs, 14, t);
            ctx.globalAlpha = 1 - t * 0.3;
            ctx.drawImage(off, (i % G) * cs * 2, Math.floor(i / G) * cs * 2, cs * 2, cs * 2, lerp(x, tx, t), lerp(y, ty, t), s, s);
            ctx.globalAlpha = 1;
          });
        }
        const outT = step === 2 ? clamp01(e * 1.8 - 0.8) : 1;
        ci.forEach((i, k) => {
          const a = stag(k, ci.length, outT);
          if (a <= 0) return;
          const x = lerp(BOX.ctx.x + BOX.ctx.w - 12, CX0 + k * 15, ease(a));
          const consumed = step === 4 ? clamp01(e * 1.6) : step > 4 ? 1 : 0;
          strip(x, CY, enc(i), P.ctx, a * (1 - consumed * 0.55));
        });
        ctx.fillStyle = P.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
        if (outT > 0.5) ctx.fillText('z: 12 vectores de contexto', CX0, CY + 62);
        arrow(IX + IMG - 30, IY - 4, BOX.ctx.x - 4, BOX.ctx.y + BOX.ctx.h / 2, P.ctx, 0.5);
      }

      // ---- Paso 3: todo vuela al encoder objetivo ----
      const TX0 = 400, TY = 324;
      if (step >= 3) {
        const flyT = step === 3 ? clamp01(e * 1.8) : 1;
        if (step === 3 && flyT < 1) {
          for (let i = 0; i < N; i++) {
            const t = ease(stag(i, N, flyT));
            const [x, y] = patchXY(i);
            const s = lerp(cs, 14, t);
            ctx.globalAlpha = 1 - t * 0.3;
            ctx.drawImage(off, (i % G) * cs * 2, Math.floor(i / G) * cs * 2, cs * 2, cs * 2, lerp(x, BOX.tgt.x + 30, t), lerp(y, BOX.tgt.y + 40, t), s, s);
            ctx.globalAlpha = 1;
          }
        }
        const outT = step === 3 ? clamp01(e * 1.8 - 0.8) : 1;
        const moveUp = step === 5 ? e : step > 5 ? 1 : 0;
        for (let i = 0; i < N; i++) {
          const a = stag(i, N, outT);
          if (a <= 0) continue;
          const x = lerp(BOX.tgt.x + BOX.tgt.w - 12, TX0 + i * 12.5, ease(a));
          if (isTgt(i)) {
            const j = tgt.indexOf(i);
            // en el paso 5 el vector objetivo sube a su sitio junto a la predicción
            const fx = lerp(x, 748 + j * 26, moveUp), fy = lerp(TY, 232, moveUp);
            strip(fx, fy, enc(i), P.tgt, a);
          } else {
            const fade = step >= 3 && outT >= 1 ? 0.25 : 1;
            strip(x, TY, enc(i), P.tgt, a * fade, 8);
          }
        }
        ctx.fillStyle = P.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
        if (outT > 0.5) ctx.fillText('s: nos quedamos con los 4 del bloque objetivo', TX0, TY + 62);
        arrow(IX + IMG - 30, IY + IMG + 4, BOX.tgt.x - 4, BOX.tgt.y + BOX.tgt.h / 2, P.tgt, 0.5);
        if (ewOk) {
          ctx.fillStyle = P.tgt; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('stop-grad', BOX.tgt.x + BOX.tgt.w / 2, BOX.tgt.y + BOX.tgt.h + 16);
        }
      }

      // ---- Paso 4: predictor ----
      const PX0 = 748, PY = 66;
      if (step >= 4) {
        const t = step === 4 ? e : 1;
        // tokens de máscara: salen de las posiciones objetivo de la imagen
        if (step === 4 && t < 0.7) {
          tgt.forEach((i, j) => {
            const [x, y] = patchXY(i);
            const k = ease(clamp01(t / 0.7));
            const mx = lerp(x + cs / 2, BOX.pred.x + 20 + j * 20, k), my = lerp(y + cs / 2, BOX.pred.y + 50, k);
            ctx.setLineDash([3, 2]); ctx.strokeStyle = P.tgt; ctx.lineWidth = 1.5; ctx.strokeRect(mx - 6, my - 12, 12, 24); ctx.setLineDash([]);
            ctx.fillStyle = P.tgt; ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillText(String(i), mx, my + 3);
          });
          ctx.fillStyle = P.tgt; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('tokens de máscara + posición', 470, 175);
        }
        const outT = clamp01((t - 0.55) / 0.45);
        tgt.forEach((_, j) => {
          const a = stag(j, 4, outT, 0.4);
          if (a <= 0) return;
          strip(lerp(BOX.pred.x + BOX.pred.w - 12, PX0 + j * 26, ease(a)), PY, pred(j), P.pred, a);
          ctx.fillStyle = P.muted; ctx.font = '9px monospace'; ctx.textAlign = 'center';
          if (a >= 1) ctx.fillText(String(tgt[j]), PX0 + j * 26 + 5, PY - 6);
        });
        if (outT > 0.5) { ctx.fillStyle = P.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('ŝ: 4 predicciones', PX0, PY + 62); }
        arrow(CX0 + 12 * 15 + 2, CY + 23, BOX.pred.x - 4, BOX.pred.y + BOX.pred.h / 2, P.ctx, 0.5);
      }

      // ---- Paso 5: pérdida ----
      if (step >= 5) {
        const t = step === 5 ? e : 1;
        if (t > 0.6) {
          const a = clamp01((t - 0.6) / 0.4);
          tgt.forEach((i, j) => {
            const pv = pred(j), sv = enc(i);
            const x = PX0 + j * 26 + 5;
            ctx.strokeStyle = alpha(P.bad, a * 0.45); ctx.lineWidth = 1;
            pv.forEach((v, k) => {
              const d = Math.abs(v - sv[k]);
              if (d < 0.02) return;
              ctx.lineWidth = 1 + d * 3;
              ctx.beginPath(); ctx.moveTo(x, PY + 46 + 2); ctx.lineTo(x, 232 - 2); ctx.stroke();
            });
          });
          ctx.fillStyle = P.surface; ctx.fillRect(PX0 - 2, PY + 50, 110, 16);
          ctx.fillStyle = P.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('ŝ: 4 predicciones', PX0, PY + 62);
          ctx.globalAlpha = a;
          ctx.fillStyle = P.surface; ctx.fillRect(736, 142, 120, 48);
          ctx.fillStyle = P.ink; ctx.font = '700 13px monospace'; ctx.textAlign = 'left';
          ctx.fillText('L = ‖ŝ − s‖²', 740, 158);
          ctx.fillStyle = mode === 'broken' && lossNow < 0.01 ? P.bad : P.pred; ctx.font = '700 18px monospace';
          ctx.fillText(lossNow.toFixed(4), 740, 182);
          ctx.globalAlpha = 1;
        }
      }

      // ---- Paso 6: gradiente hacia atrás ----
      if (step === 6) {
        const t = e;
        const flow = (x1: number, y1: number, x2: number, y2: number, col: string) => {
          arrow(x1, y1, lerp(x1, x2, t), lerp(y1, y2, t), col, 0.9, [6, 4]);
        };
        flow(760, 140, BOX.pred.x + BOX.pred.w / 2, BOX.pred.y + BOX.pred.h + 4, P.bad);
        flow(BOX.pred.x - 4, BOX.pred.y + BOX.pred.h - 10, BOX.ctx.x + BOX.ctx.w + 4, BOX.ctx.y + BOX.ctx.h - 10, P.bad);
        ctx.fillStyle = P.bad; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('∂L/∂φ', 690, 160); ctx.fillText('∂L/∂θ', 490, 152);
        if (ewOk) {
          // el gradiente choca con el stop-grad
          const sx = 700, sy = 270;
          arrow(760, 200, lerp(760, sx + 10, t), lerp(200, sy, t), P.muted, 0.6, [3, 4]);
          if (t > 0.8) {
            ctx.strokeStyle = P.bad; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(sx, sy - 10); ctx.lineTo(sx + 20, sy + 10); ctx.moveTo(sx + 20, sy - 10); ctx.lineTo(sx, sy + 10); ctx.stroke();
            ctx.fillStyle = P.muted; ctx.font = '11px sans-serif'; ctx.fillText('no pasa', sx + 10, sy + 26);
          }
        } else {
          arrow(760, 200, lerp(760, BOX.tgt.x + BOX.tgt.w + 4, t), lerp(200, BOX.tgt.y + 30, t), P.bad, 0.9, [6, 4]);
          ctx.fillStyle = P.bad; ctx.font = '700 11px sans-serif'; ctx.fillText('también al objetivo', 560, 268);
        }
        for (let k = 0; k < wCtx.length; k++) wCtx[k] = lerp(wCtxStart[k], ctxTarget[k], e);
      }

      // ---- Paso 7: EMA ----
      if (step === 7 && ewOk) {
        for (let k = 0; k < wTgt.length; k++) wTgt[k] = lerp(wTgtStart[k], tau * wTgtStart[k] + (1 - tau) * wCtx[k], e);
        arrow(BOX.ctx.x + BOX.ctx.w / 2, BOX.ctx.y + BOX.ctx.h + 6, BOX.tgt.x + BOX.tgt.w / 2, BOX.tgt.y - 6, P.tgt, 0.85, [2, 4]);
        ctx.fillStyle = P.tgt; ctx.font = '700 12px monospace'; ctx.textAlign = 'left';
        ctx.fillText(`θ̄ ← ${tau.toFixed(2)}·θ̄ + ${(1 - tau).toFixed(2)}·θ`, BOX.ctx.x + BOX.ctx.w / 2 + 10, 222);
      }

      // ---- Leyenda de dimensiones ----
      ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = P.muted;
      ctx.fillText('cada vector = 5 números: ' + CATS.join(' · '), IX, H - 10);
      ctx.textAlign = 'right';
      ctx.fillText(`iteración ${iter}`, W - 12, H - 10);
    };
    draw();
    return registerDemo(fig, (dt) => {
      if (p >= 1 && !playing) return;
      p += dt / (step === 0 || step === 1 ? 1.6 : 2.6);
      if (p >= 1) {
        p = 1; draw();
        if (!playing) return;
        hold += dt;
        if (hold > 1.1) { hold = 0; go(step + 1); }
        return;
      }
      draw();
    }, () => draw());
  });
  let hold = 0;

  function next() { playing = false; hold = 0; if (p < 1) { p = 1; draw(); } else go(step + 1); }
  function prev() { playing = false; hold = 0; if (step > 0) { step--; p = 1; draw(); } }
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>Una iteración de entrenamiento, paso a paso</h3><span class="hint">sigue cada vector desde el parche hasta la pérdida</span></div>
  <div class="overflow-x-auto"><canvas bind:this={cv} aria-label="Animación del flujo interno de un JEPA: máscara, dos encoders, predictor, pérdida, gradiente y EMA" class="max-w-full min-w-[600px]"></canvas></div>
  <div class="controls">
    <button class="chip" onclick={prev} aria-label="Paso anterior">◀</button>
    <button class="chip go" onclick={() => { playing = !playing; hold = 0; }}>{playing ? 'Pausa' : 'Reproducir'}</button>
    <button class="chip" onclick={next} aria-label="Paso siguiente">▶</button>
    <Chips label="Variante" bind:value={mode} options={[
      { value: 'ok', label: 'JEPA correcto (EMA + stop-grad)' },
      { value: 'broken', label: 'Romperlo: sin EMA ni stop-grad' },
    ]} />
  </div>
  <div class="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
    <div>
      <div class="eyebrow">Paso {step + 1} de {STEPS.length}</div>
      <div class="mt-1 font-display text-[1.05rem] font-bold">{STEPS[step].t}</div>
      <p class="mt-1 text-[.98rem]">{STEPS[step].d}</p>
      {#if mode === 'broken' && step >= 5}
        <p class="mt-1 text-[.95rem] text-bad">Sin stop-grad ni EMA, las dos ramas comparten pesos y el gradiente empuja a las dos. La salida más fácil es dar el mismo vector para todo: mira cómo los vectores se vuelven grises y la pérdida se acerca a cero en pocas iteraciones. Eso es el colapso.</p>
      {/if}
      {#if mode === 'ok'}
        <label class="slider mt-2" for="pipeTau">τ de la EMA <input id="pipeTau" type="range" min="0.5" max="0.999" step="0.001" bind:value={tau} /> <b>{tau.toFixed(3)}</b></label>
        <p class="hint mt-1">I-JEPA sube τ de 0.996 a 1.0 durante el entrenamiento. Aquí se exagera (0.9) para que veas moverse las barras.</p>
      {/if}
    </div>
    <pre class="overflow-x-auto rounded-lg border border-line bg-paper p-3 font-mono text-[.74rem] leading-[1.7]">{#each CODE as line, i}<span class="block rounded px-1 {STEPS[step].code === i ? 'bg-pred/15 text-ink font-semibold' : 'text-muted'}">{line}</span>{/each}</pre>
  </div>
  <figcaption>Las barras dentro de cada caja son los pesos de la red. En el paso 6 cambian los del encoder de contexto y del predictor; en el 8, los del objetivo se acercan un poco a los de contexto. Los vectores son de juguete (5 dimensiones con significado); en un ViT real tienen cientos.</figcaption>
</figure>
