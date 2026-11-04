<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, registerDemo, reduceMotion, gauss } from '../lib/canvas';

  // Nube inicial = A·z (casi colapsada en una línea). SIGReg la empuja hacia z ~ N(0, I), una gaussiana isotrópica.
  const W = 320, HW = 300, HH = 150, N = 420;
  const th = 0.6, A = [[Math.cos(th) * 2.1, -Math.sin(th) * 0.08], [Math.sin(th) * 2.1, Math.cos(th) * 0.08]];
  const Z = Array.from({ length: N }, () => [gauss(), gauss()]);
  const X: number[][] = [];
  let running = $state(false), dev = $state('–');
  let fig: HTMLElement, cv: HTMLCanvasElement, hcv: HTMLCanvasElement;
  let draw = () => {};
  let ang = 0.3;
  const dirs = () => [ang, ang + 2.1, ang + 4.0];

  function collapse() {
    X.length = 0;
    for (const z of Z) X.push([A[0][0] * z[0] + A[0][1] * z[1] + 0.4, A[1][0] * z[0] + A[1][1] * z[1] - 0.2]);
  }
  collapse();

  /** Aproximación didáctica del test: |media| + |desviación − 1| de cada proyección 1D, promediado. */
  function deviation() {
    let tot = 0;
    for (const a of dirs()) {
      const u = [Math.cos(a), Math.sin(a)];
      let m = 0, v = 0;
      for (const x of X) m += x[0] * u[0] + x[1] * u[1];
      m /= N;
      for (const x of X) { const p = x[0] * u[0] + x[1] * u[1] - m; v += p * p; }
      v /= N;
      tot += Math.abs(m) + Math.abs(Math.sqrt(v) - 1);
    }
    return tot / 3;
  }
  function reset() { running = false; collapse(); draw(); }

  onMount(() => {
    const ctx = setupCanvas(cv, W, W), hctx = setupCanvas(hcv, HW, HH);
    draw = () => {
      const S = W / 7.2, c = W / 2;
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, W);
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(c, c, S, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(c, c, 2 * S, 0, 7); ctx.stroke();
      dirs().forEach((a, i) => {
        ctx.strokeStyle = i === 0 ? P.pred : alpha(P.muted, 0.6); ctx.lineWidth = i === 0 ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(c - Math.cos(a) * W, c + Math.sin(a) * W); ctx.lineTo(c + Math.cos(a) * W, c - Math.sin(a) * W); ctx.stroke();
      });
      ctx.fillStyle = alpha(P.ctx, 0.55);
      for (const x of X) ctx.fillRect(c + x[0] * S - 1.5, c - x[1] * S - 1.5, 3, 3);

      // Histograma de la sombra sobre la dirección violeta, con la campana N(0,1) encima.
      const a = dirs()[0], u = [Math.cos(a), Math.sin(a)], B = 30, lo = -4, hi = 4, bins = new Array(B).fill(0);
      for (const x of X) { const p = x[0] * u[0] + x[1] * u[1], b = Math.floor(((p - lo) / (hi - lo)) * B); if (b >= 0 && b < B) bins[b]++; }
      hctx.fillStyle = P.bg; hctx.fillRect(0, 0, HW, HH);
      const bw = HW / B, scale = (HH - 20) / ((N * (hi - lo)) / B * 0.4);
      hctx.fillStyle = alpha(P.pred, 0.55);
      bins.forEach((n, i) => { const h = n * scale; hctx.fillRect(i * bw + 1, HH - 14 - h, bw - 2, h); });
      hctx.strokeStyle = P.tgt; hctx.lineWidth = 2; hctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const xv = lo + ((hi - lo) * i) / 100, pdf = Math.exp((-xv * xv) / 2) / Math.sqrt(2 * Math.PI);
        const y = HH - 14 - ((pdf * N * (hi - lo)) / B) * scale, xx = (i / 100) * HW;
        i ? hctx.lineTo(xx, y) : hctx.moveTo(xx, y);
      }
      hctx.stroke();
      hctx.fillStyle = P.muted; hctx.font = '10px sans-serif'; hctx.textAlign = 'center';
      hctx.fillText('−4', 8, HH - 2); hctx.fillText('0', HW / 2, HH - 2); hctx.fillText('4', HW - 8, HH - 2);
      hctx.textAlign = 'right'; hctx.fillStyle = P.tgt; hctx.fillText('campana ideal N(0,1)', HW - 4, 12);
      dev = deviation().toFixed(2);
    };
    draw();
    return registerDemo(fig, (dt) => {
      if (!reduceMotion) ang += dt * 0.25;
      if (running) {
        const r = reduceMotion ? 1 : Math.min(1, dt * 1.1);
        let moved = 0;
        X.forEach((x, i) => { const dx = Z[i][0] - x[0], dy = Z[i][1] - x[1]; moved += Math.abs(dx) + Math.abs(dy); x[0] += dx * r; x[1] += dy * r; });
        if (moved < 0.5) running = false;
      }
      draw();
    }, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>SIGReg en acción</h3><span class="hint">la nube empieza casi colapsada en una línea</span></div>
  <div class="flex flex-wrap items-start gap-[18px]">
    <canvas bind:this={cv} aria-label="Nube de embeddings y direcciones aleatorias" class="max-w-full"></canvas>
    <div class="min-w-0 flex-[1_1_220px]">
      <canvas bind:this={hcv} aria-label="Histograma de una proyección" class="max-w-full"></canvas>
      <div class="readout mt-2">
        <div>sombra sobre la dirección <span class="k-pred">violeta</span> frente a la campana ideal</div>
        <div>desvío de la gaussiana <b>{dev}</b></div>
      </div>
    </div>
  </div>
  <div class="controls">
    <button class="chip go" onclick={() => (running = true)}>Aplicar SIGReg</button>
    <button class="chip" onclick={reset}>Volver a colapsar</button>
  </div>
  <figcaption>Las líneas son direcciones aleatorias. Mirar sombras en 1D es mucho más barato que comprobar una distribución en cientos de dimensiones, y basta con suficientes direcciones.</figcaption>
</figure>
