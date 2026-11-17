<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, registerDemo, reduceMotion, gauss } from '../lib/canvas';

  // CEM en 1 dimensión: buscar la "acción" x que minimiza una energía con trampas (mínimos locales).
  const W = 520, H = 290, PAD = 26, XMAX = 10, N = 40, K = 8, MOM = 0.3, MU0 = 2.2, SD0 = 3;
  const E = (x: number) => 0.08 * (x - 7.5) ** 2 - 0.8 * Math.cos(2.2 * (x - 7.5));
  let it = $state(0), muTxt = $state(MU0.toFixed(2)), sdTxt = $state(SD0.toFixed(2)), bestTxt = $state('–'), running = $state(false);
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let mu = MU0, sd = SD0, samples: number[] = [], elites: number[] = [], prev: [number, number] | null = null;
  let draw = () => {};

  // Descenso por gradiente desde el mismo punto de partida, para comparar.
  let gd = MU0;
  for (let i = 0; i < 400; i++) { const g = (E(gd + 1e-4) - E(gd - 1e-4)) / 2e-4; gd -= 0.05 * g; }

  function iterate() {
    prev = [mu, sd];
    samples = Array.from({ length: N }, () => Math.max(0, Math.min(XMAX, mu + sd * gauss())));
    elites = [...samples].sort((a, b) => E(a) - E(b)).slice(0, K);
    const m = elites.reduce((s, x) => s + x, 0) / K;
    const d = Math.sqrt(elites.reduce((s, x) => s + (x - m) ** 2, 0) / K) + 0.02;
    mu = MOM * mu + (1 - MOM) * m; // momento: mezclar con la gaussiana anterior para no estrecharla de golpe
    sd = MOM * sd + (1 - MOM) * d;
    it++; muTxt = mu.toFixed(2); sdTxt = sd.toFixed(2); bestTxt = E(elites[0]).toFixed(3);
    if (sd < 0.05) running = false;
    draw();
  }
  function reset() {
    mu = MU0; sd = SD0; samples = []; elites = []; prev = null; it = 0; running = false;
    muTxt = mu.toFixed(2); sdTxt = sd.toFixed(2); bestTxt = '–'; draw();
  }

  onMount(() => {
    const ctx = setupCanvas(cv, W, H);
    let lo = Infinity, hi = -Infinity;
    for (let x = 0; x <= XMAX; x += 0.05) { lo = Math.min(lo, E(x)); hi = Math.max(hi, E(x)); }
    const X = (x: number) => PAD + (x / XMAX) * (W - 2 * PAD);
    const ET = 16, EB = 170; // franja de la curva de energía
    const Y = (e: number) => EB - ((e - lo) / (hi - lo)) * (EB - ET);
    const GB = H - 26, GT = 196; // franja de la gaussiana
    const bell = (m: number, s: number, c: string, fill: boolean) => {
      ctx.beginPath();
      for (let px = PAD; px <= W - PAD; px += 2) {
        const x = ((px - PAD) / (W - 2 * PAD)) * XMAX, d = Math.exp(-((x - m) ** 2) / (2 * s * s)) / s;
        const y = GB - Math.min(1, d / 0.9) * (GB - GT);
        px === PAD ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      if (fill) { ctx.lineTo(W - PAD, GB); ctx.lineTo(PAD, GB); ctx.fillStyle = alpha(c, 0.15); ctx.fill(); }
      else { ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]); }
    };
    draw = () => {
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = P.muted; ctx.font = '10px ' + P.mono; ctx.textAlign = 'left';
      ctx.fillText('energía E(x): distancia entre el futuro imaginado y la meta', PAD, 11);
      ctx.fillText('distribución de muestreo N(μ, σ²)', PAD, GT - 6);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.beginPath();
      for (let px = PAD; px <= W - PAD; px += 2) { const x = ((px - PAD) / (W - 2 * PAD)) * XMAX; px === PAD ? ctx.moveTo(px, Y(E(x))) : ctx.lineTo(px, Y(E(x))); }
      ctx.stroke();
      // gradiente atascado
      ctx.fillStyle = P.bad; ctx.beginPath(); ctx.arc(X(gd), Y(E(gd)), 6, 0, 7); ctx.fill();
      ctx.font = '700 10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('gradiente: atascado', X(gd), Y(E(gd)) + 18);
      // muestras y élites
      for (const x of samples) { ctx.fillStyle = alpha(P.muted, 0.7); ctx.beginPath(); ctx.arc(X(x), Y(E(x)), 3.2, 0, 7); ctx.fill(); ctx.fillRect(X(x) - 0.5, GB - 8, 1, 8); }
      for (const x of elites) { ctx.fillStyle = P.pred; ctx.beginPath(); ctx.arc(X(x), Y(E(x)), 5, 0, 7); ctx.fill(); ctx.fillRect(X(x) - 1, GB - 14, 2, 14); }
      // gaussianas: anterior (punteada) y actual (rellena)
      if (prev) bell(prev[0], prev[1], P.muted, false);
      bell(mu, sd, P.pred, true);
      ctx.strokeStyle = P.pred; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(mu), GT); ctx.lineTo(X(mu), GB); ctx.stroke();
      ctx.strokeStyle = P.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PAD, GB); ctx.lineTo(W - PAD, GB); ctx.stroke();
      ctx.fillStyle = P.muted; ctx.font = '10px ' + P.mono;
      for (let t = 0; t <= XMAX; t += 2) ctx.fillText(String(t), X(t), GB + 13);
      ctx.fillStyle = P.ok; ctx.fillText('mejor acción', X(7.5), Y(E(7.5)) + 16);
    };
    reset();
    let t = 0;
    return registerDemo(fig, (dt) => {
      if (!running) return;
      t += dt;
      if (t > (reduceMotion ? 0.4 : 0.9)) { t = 0; iterate(); }
    }, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>CEM: muestrear, quedarse con las mejores, reajustar</h3><span class="hint">ejecuta iteración a iteración</span></div>
  <div class="flex flex-wrap items-start gap-[18px]">
    <canvas bind:this={cv} aria-label="Método de entropía cruzada en una dimensión" class="max-w-full"></canvas>
    <div class="readout min-w-0 flex-[1_1_170px]">
      <div>iteración <b>{it}</b></div>
      <div>media μ <b>{muTxt}</b></div>
      <div>desviación σ <b>{sdTxt}</b></div>
      <div>mejor energía <b>{bestTxt}</b></div>
      <div class="mt-2 max-w-[28ch] font-body text-[.93rem] text-ink">Cada iteración: saca {N} acciones de la gaussiana, evalúa su energía, se queda con las {K} mejores (violeta) y mueve la media y la desviación hacia las de ellas (con un 30 % de la anterior, para no estrecharse de golpe).</div>
      <div class="legend mt-2"><span style="--c:var(--muted)">muestras</span><span style="--c:var(--pred)">élites</span><span style="--c:var(--bad)">gradiente</span></div>
    </div>
  </div>
  <div class="controls">
    <button class="chip go" onclick={() => { running = false; iterate(); }}>Una iteración</button>
    <button class="chip" onclick={() => (running = !running)}>{running ? 'Pausar' : 'Automático'}</button>
    <button class="chip" onclick={reset}>Reiniciar</button>
  </div>
  <figcaption>Ambos empiezan en x = {MU0}. El descenso por gradiente baja al valle más cercano y se queda ahí. CEM mira muchos puntos a la vez, así que suele saltar los valles falsos; a cambio, depende del azar: reinicia unas cuantas veces y verás que a veces también se queda en uno. En V-JEPA 2-AC, x no es un número sino una secuencia de acciones del brazo, y E se calcula con el predictor.</figcaption>
</figure>
