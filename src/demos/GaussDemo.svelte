<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, registerDemo, reduceMotion, gauss } from '../lib/canvas';

  // Muestras x = μ + σ·ε con ε ~ N(0, 1), acumuladas en un histograma frente a la curva teórica.
  const W = 500, H = 250, XMIN = -5, XMAX = 5, NB = 50, PAD = 24;
  let mu = $state(0), sigma = $state(1), running = $state(true);
  let n = $state(0), in1 = $state(0), in2 = $state(0), mean = $state(0), sd = $state(0);
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let bins = new Array(NB).fill(0), sum = 0, sum2 = 0, c1 = 0, c2 = 0, last: number[] = [];
  let draw = () => {};

  function reset() {
    bins = new Array(NB).fill(0); sum = sum2 = c1 = c2 = 0; last = []; n = 0; in1 = in2 = mean = sd = 0; draw();
  }
  function sample(k: number) {
    for (let i = 0; i < k; i++) {
      const eps = gauss(), x = mu + sigma * eps;
      last.push(x); if (last.length > 12) last.shift();
      const b = Math.floor(((x - XMIN) / (XMAX - XMIN)) * NB);
      if (b >= 0 && b < NB) bins[b]++;
      sum += x; sum2 += x * x; if (Math.abs(eps) < 1) c1++; if (Math.abs(eps) < 2) c2++;
      n++;
    }
    mean = sum / n; sd = Math.sqrt(Math.max(0, sum2 / n - mean * mean)); in1 = c1 / n; in2 = c2 / n;
  }

  onMount(() => {
    const ctx = setupCanvas(cv, W, H);
    const X = (x: number) => PAD + ((x - XMIN) / (XMAX - XMIN)) * (W - 2 * PAD);
    const pdf = (x: number) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));
    draw = () => {
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const base = H - 30, top = 18, ymax = 1.05;
      const Y = (d: number) => base - (d / ymax) * (base - top);
      // franjas ±1σ y ±2σ
      ctx.fillStyle = alpha(P.pred, 0.06); ctx.fillRect(X(mu - 2 * sigma), top, X(mu + 2 * sigma) - X(mu - 2 * sigma), base - top);
      ctx.fillStyle = alpha(P.pred, 0.1); ctx.fillRect(X(mu - sigma), top, X(mu + sigma) - X(mu - sigma), base - top);
      // histograma normalizado a densidad
      const bw = (XMAX - XMIN) / NB;
      ctx.fillStyle = alpha(P.ctx, 0.55);
      if (n) bins.forEach((c, i) => {
        const d = c / (n * bw), x0 = X(XMIN + i * bw), x1 = X(XMIN + (i + 1) * bw);
        ctx.fillRect(x0 + 0.5, Y(Math.min(d, ymax)), x1 - x0 - 1, base - Y(Math.min(d, ymax)));
      });
      // curva teórica
      ctx.strokeStyle = P.pred; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let px = PAD; px <= W - PAD; px += 2) {
        const x = XMIN + ((px - PAD) / (W - 2 * PAD)) * (XMAX - XMIN), y = Y(Math.min(pdf(x), ymax * 1.05));
        px === PAD ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.stroke();
      // eje
      ctx.strokeStyle = P.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PAD, base); ctx.lineTo(W - PAD, base); ctx.stroke();
      ctx.fillStyle = P.muted; ctx.font = '10px ' + P.mono; ctx.textAlign = 'center';
      for (let t = XMIN; t <= XMAX; t++) { ctx.fillText(String(t), X(t), base + 14); }
      ctx.fillStyle = P.pred; ctx.font = '700 11px ' + P.mono;
      ctx.fillText('μ', X(mu), top - 4); ctx.fillText('−σ', X(mu - sigma), top - 4); ctx.fillText('+σ', X(mu + sigma), top - 4);
      // últimas muestras como gotas
      ctx.fillStyle = P.tgt;
      last.forEach((x, i) => { ctx.globalAlpha = (i + 1) / last.length; ctx.beginPath(); ctx.arc(X(x), base - 6, 3.5, 0, 7); ctx.fill(); });
      ctx.globalAlpha = 1;
    };
    reset();
    sample(40); draw();
    return registerDemo(fig, (dt) => {
      if (!running || n > 20000) return;
      sample(reduceMotion ? 200 : Math.max(1, Math.round(dt * 240)));
      draw();
    }, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>Llenar una campana, muestra a muestra</h3><span class="hint">mueve μ y σ: el histograma vuelve a empezar</span></div>
  <canvas bind:this={cv} aria-label="Histograma de muestras gaussianas frente a la curva teórica" class="max-w-full"></canvas>
  <div class="mt-3 flex flex-wrap items-start gap-x-8 gap-y-3">
    <div class="grid gap-1">
      <label class="slider">media μ = <b class="text-ink">{mu.toFixed(1)}</b>
        <input type="range" min="-2.5" max="2.5" step="0.1" bind:value={mu} oninput={reset} /></label>
      <label class="slider">desviación σ = <b class="text-ink">{sigma.toFixed(2)}</b>
        <input type="range" min="0.4" max="2" step="0.05" bind:value={sigma} oninput={reset} /></label>
    </div>
    <div class="readout">
      <div>muestras <b>{n}</b></div>
      <div>media de las muestras <b>{mean.toFixed(2)}</b>  (μ = {mu.toFixed(1)})</div>
      <div>desviación de las muestras <b>{sd.toFixed(2)}</b>  (σ = {sigma.toFixed(2)})</div>
      <div>dentro de μ ± 1σ <b>{(in1 * 100).toFixed(1)} %</b>  (teoría: 68.3 %)</div>
      <div>dentro de μ ± 2σ <b>{(in2 * 100).toFixed(1)} %</b>  (teoría: 95.4 %)</div>
    </div>
  </div>
  <div class="controls">
    <button class="chip go" onclick={() => (running = !running)}>{running ? 'Pausar' : 'Seguir muestreando'}</button>
    <button class="chip" onclick={reset}>Vaciar</button>
  </div>
  <figcaption>Cada gota ámbar es un número x = μ + σ·ε, donde ε sale de la campana estándar (media 0, desviación 1). Con pocas muestras el histograma es irregular; con miles, se pega a la curva. Esa misma fórmula es la que usa CEM para proponer acciones.</figcaption>
</figure>
