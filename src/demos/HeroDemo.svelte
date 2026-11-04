<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, pointerPos, registerDemo, reduceMotion } from '../lib/canvas';
  import { CATS, drawScene, patchConcepts } from '../lib/scene';

  const G = 8, W = 320, cs = W / G;
  let fig: HTMLElement, cv: HTMLCanvasElement, gcv: HTMLCanvasElement;
  let mask = $state(new Set(['4,3', '5,3', '6,3', '4,4', '5,4', '6,4', '4,5', '5,5', '6,5']));
  let hover: [number, number] | null = null;

  // Verdad (ámbar) y predicción (violeta): la predicción mezcla la verdad con el promedio del contexto visible.
  const stats = $derived.by(() => {
    const truth = [0, 0, 0, 0, 0], ctxv = [0, 0, 0, 0, 0];
    let nm = 0, nc = 0;
    for (let gy = 0; gy < G; gy++) for (let gx = 0; gx < G; gx++) {
      const v = patchConcepts(gx, gy, G, W);
      if (mask.has(gx + ',' + gy)) { v.forEach((a, i) => (truth[i] += a)); nm++; }
      else { v.forEach((a, i) => (ctxv[i] += a)); nc++; }
    }
    const t = truth.map((a) => (nm ? a / nm : 0));
    const c = ctxv.map((a) => (nc ? a / nc : 0));
    return { truth: t, pred: t.map((a, i) => (nm ? a * 0.82 + c[i] * 0.18 : 0)), pixels: nm * 40 * 40 * 3 };
  });

  onMount(() => {
    const ctx = setupCanvas(cv, W, W);
    const gctx = setupCanvas(gcv, 120, 120);
    const off = document.createElement('canvas');
    off.width = W; off.height = W;
    const octx = off.getContext('2d')!;
    let t0 = 0;

    function draw(time = t0) {
      drawScene(octx, W);
      ctx.clearRect(0, 0, W, W);
      ctx.drawImage(off, 0, 0, W, W);
      ctx.strokeStyle = alpha(P.ink, 0.18); ctx.lineWidth = 1;
      for (let i = 1; i < G; i++) {
        ctx.beginPath(); ctx.moveTo(i * cs, 0); ctx.lineTo(i * cs, W); ctx.moveTo(0, i * cs); ctx.lineTo(W, i * cs); ctx.stroke();
      }
      for (const k of mask) {
        const [gx, gy] = k.split(',').map(Number);
        ctx.fillStyle = P.surface; ctx.fillRect(gx * cs, gy * cs, cs, cs);
        ctx.fillStyle = alpha(P.tgt, 0.28); ctx.fillRect(gx * cs, gy * cs, cs, cs);
        ctx.strokeStyle = P.tgt; ctx.lineWidth = 2; ctx.strokeRect(gx * cs + 1, gy * cs + 1, cs - 2, cs - 2);
        ctx.fillStyle = P.tgt; ctx.font = '600 16px ' + P.mono; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('?', gx * cs + cs / 2, gy * cs + cs / 2);
      }
      ctx.strokeStyle = P.ctx; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, W - 3, W - 3);
      if (hover) { ctx.strokeStyle = P.pred; ctx.lineWidth = 2; ctx.strokeRect(hover[0] * cs + 1, hover[1] * cs + 1, cs - 2, cs - 2); }

      // Panel generativo: los píxeles exactos del hueco, con "ruido" que parpadea (incertidumbre).
      const ks = [...mask].map((k) => k.split(',').map(Number));
      gctx.clearRect(0, 0, 120, 120); gctx.fillStyle = P.bg; gctx.fillRect(0, 0, 120, 120);
      if (!ks.length) {
        gctx.fillStyle = P.muted; gctx.font = '12px sans-serif'; gctx.textAlign = 'center'; gctx.fillText('nada oculto', 60, 62);
        return;
      }
      const minx = Math.min(...ks.map((k) => k[0])), maxx = Math.max(...ks.map((k) => k[0]));
      const miny = Math.min(...ks.map((k) => k[1])), maxy = Math.max(...ks.map((k) => k[1]));
      const bw = (maxx - minx + 1) * cs, bh = (maxy - miny + 1) * cs, s = Math.min(120 / bw, 120 / bh);
      const ox = (120 - bw * s) / 2, oy = (120 - bh * s) / 2;
      for (const [gx, gy] of ks)
        gctx.drawImage(off, gx * cs, gy * cs, cs, cs, ox + (gx - minx) * cs * s, oy + (gy - miny) * cs * s, cs * s + 0.5, cs * s + 0.5);
      const px = 4, seed = Math.floor(time * 6);
      for (const [gx, gy] of ks)
        for (let yy = 0; yy < cs * s; yy += px) for (let xx = 0; xx < cs * s; xx += px) {
          const h = Math.sin(gx * 97 + gy * 31 + xx * 7.1 + yy * 3.3 + seed * 13.7) * 43758.5, r = h - Math.floor(h);
          if (r < 0.35) {
            gctx.fillStyle = alpha(r < 0.17 ? P.ink : P.surface, 0.35);
            gctx.fillRect(ox + (gx - minx) * cs * s + xx, oy + (gy - miny) * cs * s + yy, px, px);
          }
        }
    }

    cv.addEventListener('click', (e) => {
      const [x, y] = pointerPos(cv, e);
      const k = Math.floor(x / cs) + ',' + Math.floor(y / cs);
      const next = new Set(mask);
      next.has(k) ? next.delete(k) : next.add(k);
      mask = next;
      draw();
    });
    cv.addEventListener('mousemove', (e) => { const [x, y] = pointerPos(cv, e); hover = [Math.floor(x / cs), Math.floor(y / cs)]; });
    cv.addEventListener('mouseleave', () => (hover = null));
    draw(0);
    return registerDemo(fig, (_dt, t) => { t0 = reduceMotion ? 0 : t; draw(); }, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>Tapa partes de la escena</h3><span class="hint">toca los parches para ocultarlos o mostrarlos</span></div>
  <div class="flex flex-wrap items-start gap-[18px]">
    <canvas bind:this={cv} aria-label="Escena con parches ocultables" class="max-w-full"></canvas>
    <div class="grid min-w-0 flex-[1_1_260px] gap-3.5">
      <div class="grid grid-cols-1 gap-3 min-[521px]:grid-cols-2">
        <div class="min-w-0">
          <h4 class="mb-1.5 text-[.9rem]">Un modelo generativo debe dibujar</h4>
          <canvas bind:this={gcv} aria-label="Lo que un modelo generativo debe reconstruir"></canvas>
          <div class="mt-1.5 font-mono text-[.78rem] text-muted tabular-nums">
            <b class="block font-display text-[1.25rem] text-ink">{stats.pixels.toLocaleString('es')}</b>números (píxeles × RGB)
          </div>
        </div>
        <div class="min-w-0">
          <h4 class="mb-1.5 text-[.9rem]">JEPA solo debe predecir</h4>
          <div class="grid gap-1.5">
            {#each CATS as c, i}
              <div class="grid grid-cols-[52px_1fr_40px] items-center gap-2 font-mono text-[.74rem] text-muted">
                <span>{c}</span>
                <span class="relative h-3 overflow-hidden rounded-md border border-line bg-paper">
                  <i class="absolute inset-y-0 left-0 rounded-md bg-pred transition-[width] duration-300" style:width="{stats.pred[i] * 100}%"></i>
                  <u class="absolute -inset-y-px w-0.5 bg-tgt transition-[left] duration-300" style:left="calc({stats.truth[i] * 100}% - 1px)"></u>
                </span>
                <span>{Math.round(stats.pred[i] * 100)}%</span>
              </div>
            {/each}
          </div>
          <div class="mt-1.5 font-mono text-[.78rem] text-muted">
            <b class="block font-display text-[1.25rem] text-ink">5</b>dimensiones abstractas
          </div>
        </div>
      </div>
      <div class="legend"><span style="--c:var(--tgt)">valor real (objetivo)</span><span style="--c:var(--pred)">predicción desde el contexto</span></div>
    </div>
  </div>
  <figcaption>
    Para rellenar el hueco, un modelo generativo tiene que acertar cada hoja y cada ladrillo. JEPA solo necesita saber "ahí hay una casa y un
    poco de cielo". En los papers reales el vector abstracto tiene cientos o miles de dimensiones (1280 en un ViT-Huge), no 5, pero la idea es la misma.
  </figcaption>
</figure>
