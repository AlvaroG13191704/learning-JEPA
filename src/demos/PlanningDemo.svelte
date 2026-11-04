<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, pointerPos, registerDemo, reduceMotion, gauss } from '../lib/canvas';

  // Planificación con el método de entropía cruzada (CEM), como V-JEPA 2-AC pero en 2D.
  const W = 480, H = 300, NS = 40, HZ = 5, K = 6, ITERS = 3, MAXA = 22;
  type Pt = [number, number];
  type Cand = { seq: Pt[]; path: Pt[]; e: number };
  let step = $state(0), energyTxt = $state('–'), running = $state(false);
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let agent: Pt = [70, 230], goal: Pt = [400, 80], cands: Cand[] = [], elites: Cand[] = [], trail: Pt[] = [];
  let draw = () => {};

  const energy = (p: Pt) => Math.hypot(p[0] - goal[0], p[1] - goal[1]);
  function rollout(seq: Pt[]) {
    let p: Pt = [...agent];
    const path: Pt[] = [p];
    for (const a of seq) { p = [Math.max(10, Math.min(W - 10, p[0] + a[0])), Math.max(10, Math.min(H - 10, p[1] + a[1]))]; path.push(p); }
    return path;
  }
  function plan(): Pt {
    let mu: Pt[] = Array.from({ length: HZ }, () => [0, 0]);
    let sd: Pt[] = Array.from({ length: HZ }, () => [MAXA * 0.8, MAXA * 0.8]);
    let all: Cand[] = [], best: Cand[] = [];
    for (let it = 0; it < ITERS; it++) {
      all = [];
      for (let n = 0; n < NS; n++) {
        const seq = mu.map((m, i): Pt => {
          let a: Pt = [m[0] + gauss() * sd[i][0], m[1] + gauss() * sd[i][1]];
          const L = Math.hypot(a[0], a[1]);
          if (L > MAXA) a = [(a[0] / L) * MAXA, (a[1] / L) * MAXA];
          return a;
        });
        const path = rollout(seq);
        all.push({ seq, path, e: energy(path[path.length - 1]) });
      }
      all.sort((a, b) => a.e - b.e);
      best = all.slice(0, K);
      mu = mu.map((_, i): Pt => [best.reduce((s, b) => s + b.seq[i][0], 0) / K, best.reduce((s, b) => s + b.seq[i][1], 0) / K]);
      sd = sd.map((_, i): Pt => [
        Math.sqrt(best.reduce((s, b) => s + (b.seq[i][0] - mu[i][0]) ** 2, 0) / K) + 1,
        Math.sqrt(best.reduce((s, b) => s + (b.seq[i][1] - mu[i][1]) ** 2, 0) / K) + 1,
      ]);
    }
    cands = all; elites = best;
    return best[0].seq[0];
  }
  function stepOnce() {
    if (energy(agent) < 8) { running = false; return; }
    const a = plan();
    trail.push([...agent]);
    agent = [agent[0] + a[0], agent[1] + a[1]];
    step++;
    energyTxt = energy(agent).toFixed(0) + ' px';
    draw();
  }
  function reset() {
    agent = [70, 230]; cands = []; elites = []; trail = []; step = 0; running = false;
    energyTxt = energy(agent).toFixed(0) + ' px';
    draw();
  }
  function toggle() { running = !running; if (running) stepOnce(); }

  onMount(() => {
    const ctx = setupCanvas(cv, W, H);
    const line = (path: Pt[]) => { ctx.beginPath(); path.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); };
    draw = () => {
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = P.tgt; ctx.setLineDash([4, 3]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(goal[0], goal[1], 16, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = alpha(P.tgt, 0.25); ctx.beginPath(); ctx.arc(goal[0], goal[1], 16, 0, 7); ctx.fill();
      ctx.fillStyle = P.tgt; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('imagen meta', goal[0], goal[1] - 24);
      ctx.strokeStyle = alpha(P.muted, 0.35); ctx.lineWidth = 1; cands.forEach((c) => line(c.path));
      ctx.strokeStyle = P.pred; ctx.lineWidth = 2; elites.forEach((c) => line(c.path));
      if (trail.length) { ctx.strokeStyle = P.ctx; ctx.lineWidth = 2.5; line([...trail, agent]); }
      ctx.fillStyle = P.ctx; ctx.beginPath(); ctx.arc(agent[0], agent[1], 9, 0, 7); ctx.fill();
      ctx.fillStyle = P.surface; ctx.beginPath(); ctx.arc(agent[0], agent[1], 3.5, 0, 7); ctx.fill();
      ctx.fillStyle = P.ctx; ctx.font = '700 11px sans-serif'; ctx.fillText('brazo', agent[0], agent[1] + 24);
    };
    cv.addEventListener('click', (e) => {
      goal = pointerPos(cv, e); cands = []; elites = [];
      energyTxt = energy(agent).toFixed(0) + ' px';
      draw();
    });
    reset();
    plan(); draw(); // un plan inicial para que la demo se vea completa en reposo
    let timer = 0;
    return registerDemo(fig, (dt) => {
      if (!running) return;
      timer += dt;
      if (timer > (reduceMotion ? 0.2 : 0.45)) { timer = 0; stepOnce(); }
    }, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>Planificar en el espacio de representaciones</h3><span class="hint">toca el área para mover la meta</span></div>
  <div class="flex flex-wrap items-start gap-[18px]">
    <canvas bind:this={cv} aria-label="Planificación con el método de entropía cruzada" class="max-w-full"></canvas>
    <div class="readout min-w-0 flex-[1_1_180px]">
      <div>paso <b>{step}</b></div>
      <div>energía (distancia a la meta) <b>{energyTxt}</b></div>
      <div class="mt-2 max-w-[28ch] font-body text-[.93rem] text-ink">
        En cada paso: imagina 40 secuencias de 5 acciones, conserva las 6 mejores, afina la búsqueda alrededor de ellas, y ejecuta solo la primera acción.
      </div>
      <div class="legend mt-2"><span style="--c:var(--muted)">imaginadas</span><span style="--c:var(--pred)">mejores</span><span style="--c:var(--tgt)">meta</span></div>
    </div>
  </div>
  <div class="controls">
    <button class="chip go" onclick={toggle}>{running ? 'Pausar' : 'Planificar'}</button>
    <button class="chip" onclick={reset}>Reiniciar</button>
  </div>
  <figcaption>Una versión de juguete: aquí la "representación" es la posición, y el modelo del mundo es perfecto. En V-JEPA 2-AC cada línea sería una secuencia de representaciones de video imaginadas por el predictor.</figcaption>
</figure>
