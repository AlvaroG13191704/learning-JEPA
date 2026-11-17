<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, registerDemo, gauss } from '../lib/canvas';
  import Chips from '../lib/Chips.svelte';

  // Una nube de embeddings z = R·diag(s1, s2)·ε. Medimos su covarianza, autovalores, rango efectivo y los términos de VICReg.
  type Preset = 'sano' | 'dimensional' | 'total';
  const W = 300, N = 300, TH = Math.PI / 4, C = Math.cos(TH), S = Math.sin(TH), SC = 52;
  const eps = Array.from({ length: N }, () => [gauss(), gauss()]);
  let preset = $state<Preset>('sano');
  let squash = $state(1), shrink = $state(1);
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let draw = () => {};

  let pts = $derived(eps.map(([a, b]) => {
    const u = a * Math.sqrt(2 - squash * squash) * shrink, v = b * squash * shrink; // la varianza total se conserva
    return [C * u - S * v, S * u + C * v];
  }));
  let stats = $derived.by(() => {
    let mx = 0, my = 0;
    for (const [x, y] of pts) { mx += x; my += y; }
    mx /= N; my /= N;
    let a = 0, b = 0, c = 0;
    for (const [x, y] of pts) { const dx = x - mx, dy = y - my; a += dx * dx; b += dx * dy; c += dy * dy; }
    a /= N - 1; b /= N - 1; c /= N - 1;
    const tr = a + c, det = a * c - b * b, disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
    const l1 = tr / 2 + disc, l2 = Math.max(0, tr / 2 - disc), sum = l1 + l2;
    let erank = 0;
    if (sum > 1e-9) {
      const p = [l1 / sum, l2 / sum].filter((v) => v > 1e-12);
      erank = Math.exp(-p.reduce((s, v) => s + v * Math.log(v), 0));
    }
    const vVar = (Math.max(0, 1 - Math.sqrt(a)) + Math.max(0, 1 - Math.sqrt(c))) / 2;
    const vCov = (2 * b * b) / 2;
    const ang = Math.atan2(l1 - a, b || 1e-9);
    return { a, b, c, l1, l2, erank, vVar, vCov, ang };
  });

  $effect(() => {
    if (preset === 'sano') { squash = 1; shrink = 1; }
    else if (preset === 'dimensional') { squash = 0.05; shrink = 1; }
    else { squash = 1; shrink = 0.03; }
  });
  $effect(() => { void stats; draw(); });

  onMount(() => {
    const ctx = setupCanvas(cv, W, W);
    draw = () => {
      const O = W / 2;
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, W);
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(O, 8); ctx.lineTo(O, W - 8); ctx.moveTo(8, O); ctx.lineTo(W - 8, O); ctx.stroke();
      ctx.fillStyle = alpha(P.ctx, 0.55);
      for (const [x, y] of pts) { ctx.beginPath(); ctx.arc(O + x * SC, O - y * SC, 2.6, 0, 7); ctx.fill(); }
      // ejes propios (autovectores) escalados por la raíz del autovalor: 2 desviaciones
      const { l1, l2, ang } = stats;
      const axes: [number, number, string][] = [[ang, l1, P.pred], [ang + Math.PI / 2, l2, P.tgt]];
      for (const [t, l, col] of axes) {
        const r = 2 * Math.sqrt(l) * SC;
        ctx.strokeStyle = col; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(O - Math.cos(t) * r, O + Math.sin(t) * r); ctx.lineTo(O + Math.cos(t) * r, O - Math.sin(t) * r); ctx.stroke();
      }
      ctx.fillStyle = P.muted; ctx.font = '11px ' + P.mono; ctx.textAlign = 'left';
      ctx.fillText('dim 1 →', W - 60, O - 6); ctx.fillText('dim 2 ↑', O + 6, 18);
    };
    draw();
    return registerDemo(fig, undefined, () => draw());
  });
  const f = (v: number, d = 2) => v.toFixed(d).replace(/^-(0\.0+)$/, '$1');
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>El colapso visto por el álgebra lineal</h3><span class="hint">cada punto es el embedding de una imagen</span></div>
  <div class="flex flex-wrap items-start gap-[18px]">
    <canvas bind:this={cv} aria-label="Nube de embeddings con sus ejes propios" class="max-w-full"></canvas>
    <div class="readout min-w-0 flex-[1_1_230px]">
      <div>matriz de covarianza Σ =</div>
      <div class="pl-3">[ <b>{f(stats.a)}</b>  <b>{f(stats.b)}</b> ]<br />[ <b>{f(stats.b)}</b>  <b>{f(stats.c)}</b> ]</div>
      <div>autovalores <span class="text-pred">λ₁ = <b>{f(stats.l1)}</b></span>  <span class="text-tgt">λ₂ = <b>{f(stats.l2, 3)}</b></span></div>
      <div>rango efectivo <b>{f(stats.erank)}</b> <span>(máx. 2)</span></div>
      <div class="mt-1">VICReg · varianza (std por coordenada &lt; 1) <b>{f(stats.vVar, 3)}</b></div>
      <div>VICReg · covarianza (fuera de la diagonal) <b>{f(stats.vCov, 3)}</b></div>
      <label class="slider mt-2">aplastar la 2.ª dirección (su varianza pasa a la 1.ª) <b class="text-ink">{f(squash)}</b>
        <input type="range" min="0" max="1" step="0.01" bind:value={squash} /></label>
      <label class="slider">encoger toda la nube <b class="text-ink">{f(shrink)}</b>
        <input type="range" min="0" max="1" step="0.01" bind:value={shrink} /></label>
    </div>
  </div>
  <Chips label="Ejemplo" bind:value={preset} options={[
    { value: 'sano', label: 'Sano (gaussiana isotrópica)' },
    { value: 'dimensional', label: 'Colapso dimensional' },
    { value: 'total', label: 'Colapso total' },
  ]} />
  <figcaption>Fíjate en el colapso dimensional: la nube se vuelve una línea diagonal, pero cada coordenada por separado sigue teniendo desviación 1, así que el término de varianza de VICReg no se queja. Quien detecta el problema es el término de covarianza (y el autovalor λ₂ que cae a 0). Por eso VICReg necesita los dos términos, y por eso SIGReg mira muchas direcciones, no solo los ejes.</figcaption>
</figure>
