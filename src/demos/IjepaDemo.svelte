<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, registerDemo, reduceMotion, rnd } from '../lib/canvas';
  import { drawScene } from '../lib/scene';

  // Rangos del paper: 4 objetivos con escala 15–20 % y proporción 0.75–1.5; contexto con escala 85–100 %.
  const W = 336, G = 14, cs = W / G;
  type Block = { x: number; y: number; w: number; h: number };
  let small = $state(false);
  let nCtx = $state(0), nTgt = $state(0);
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let tgts: Block[] = [], ctxSet = new Set<string>(), anim = 1;
  let draw = () => {};

  function block(sMin: number, sMax: number, arMin: number, arMax: number): Block {
    const s = rnd(sMin, sMax) * G * G, ar = Math.exp(rnd(Math.log(arMin), Math.log(arMax)));
    const h = Math.max(1, Math.min(G, Math.round(Math.sqrt(s * ar))));
    const w = Math.max(1, Math.min(G, Math.round(Math.sqrt(s / ar))));
    return { x: Math.floor(Math.random() * (G - w + 1)), y: Math.floor(Math.random() * (G - h + 1)), w, h };
  }
  function sample() {
    tgts = [];
    const tset = new Set<string>();
    for (let i = 0; i < 4; i++) {
      const b = small ? { x: Math.floor(Math.random() * G), y: Math.floor(Math.random() * G), w: 1, h: 1 } : block(0.15, 0.2, 0.75, 1.5);
      tgts.push(b);
      for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) tset.add(x + ',' + y);
    }
    const c = block(0.85, 1, 1, 1);
    ctxSet = new Set();
    for (let y = c.y; y < c.y + c.h; y++) for (let x = c.x; x < c.x + c.w; x++) { const k = x + ',' + y; if (!tset.has(k)) ctxSet.add(k); }
    nCtx = ctxSet.size; nTgt = tset.size;
    anim = reduceMotion ? 1 : 0;
    draw();
  }
  function toggleSmall() { small = !small; sample(); }

  onMount(() => {
    const ctx = setupCanvas(cv, W, W);
    const off = document.createElement('canvas'); off.width = W; off.height = W;
    const octx = off.getContext('2d')!;
    draw = () => {
      drawScene(octx, W);
      ctx.clearRect(0, 0, W, W);
      ctx.globalAlpha = 0.28; ctx.drawImage(off, 0, 0); ctx.globalAlpha = 1;
      for (const k of ctxSet) { const [x, y] = k.split(',').map(Number); ctx.drawImage(off, x * cs, y * cs, cs, cs, x * cs, y * cs, cs, cs); }
      ctx.strokeStyle = alpha(P.ink, 0.12); ctx.lineWidth = 1;
      for (let i = 1; i < G; i++) { ctx.beginPath(); ctx.moveTo(i * cs, 0); ctx.lineTo(i * cs, W); ctx.moveTo(0, i * cs); ctx.lineTo(W, i * cs); ctx.stroke(); }
      const e = 1 - Math.pow(1 - anim, 3);
      tgts.forEach((b, i) => {
        const a = Math.max(0, Math.min(1, e * 4 - i));
        ctx.fillStyle = alpha(P.tgt, 0.3 * a); ctx.fillRect(b.x * cs, b.y * cs, b.w * cs, b.h * cs);
        ctx.strokeStyle = alpha(P.tgt, a); ctx.lineWidth = 2.5; ctx.strokeRect(b.x * cs + 1.5, b.y * cs + 1.5, b.w * cs - 3, b.h * cs - 3);
        ctx.fillStyle = alpha(P.tgt, a); ctx.font = '700 12px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('y' + (i + 1), b.x * cs + 5, b.y * cs + 4);
      });
      ctx.fillStyle = alpha(P.ctx, 0.1);
      for (const k of ctxSet) { const [x, y] = k.split(',').map(Number); ctx.fillRect(x * cs, y * cs, cs, cs); }
    };
    sample(); anim = 1; draw();
    return registerDemo(fig, (dt) => { if (anim < 1) { anim = Math.min(1, anim + dt * 1.6); draw(); } }, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>El generador de máscaras de I-JEPA</h3><span class="hint">con los rangos reales del paper</span></div>
  <div class="flex flex-wrap items-start gap-[18px]">
    <canvas bind:this={cv} aria-label="Máscaras de I-JEPA sobre la escena" class="max-w-full"></canvas>
    <div class="readout min-w-0 flex-[1_1_200px]">
      <div>cuadrícula <b>14 × 14</b> = 196 parches</div>
      <div>objetivos <b>4</b> bloques, escala 15–20 %, proporción 0.75–1.5</div>
      <div>contexto: escala 85–100 %, sin solapar objetivos</div>
      <div class="mt-2">parches de contexto <b>{nCtx}</b></div>
      <div>parches objetivo <b>{nTgt}</b> (con solapes entre bloques)</div>
      <div>la red ve <b>{Math.round((nCtx / 196) * 100)} %</b> de la imagen</div>
      <div class="legend mt-2.5"><span style="--c:var(--ctx)">contexto</span><span style="--c:var(--tgt)">objetivos</span></div>
    </div>
  </div>
  <div class="controls">
    <button class="chip go" onclick={sample}>Nuevas máscaras</button>
    <button class="chip" aria-pressed={small} onclick={toggleSmall}>{small ? 'Volver a bloques del paper' : 'Probar objetivos diminutos'}</button>
  </div>
  <figcaption>Con objetivos diminutos (1 parche) casi todo es visible y basta con copiar al vecino: la red aprende detalles locales, no semántica. El paper muestra que los bloques grandes dan mejores representaciones.</figcaption>
</figure>
