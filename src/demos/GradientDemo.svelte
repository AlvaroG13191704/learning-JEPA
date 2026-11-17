<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, pointerPos, registerDemo, reduceMotion, gauss } from '../lib/canvas';

  // Pérdida de juguete: un valle alargado y girado, L(w) = ½(a·u² + b·v²) con (u, v) = w rotado.
  const W = 440, H = 300, S = 62, A = 1, B = 7, TH = 0.5, CT = Math.cos(TH), ST = Math.sin(TH);
  const O = [W / 2, H / 2];
  let lr = $state(0.12), noisy = $state(false), running = $state(false);
  let step = $state(0), lossTxt = $state('–'), gradTxt = $state('–'), status = $state('');
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let start: [number, number] = [-2.4, -0.2];
  let w: [number, number] = [...start], trail: [number, number][] = [];
  let draw = () => {};

  const rot = (x: number, y: number) => [CT * x + ST * y, -ST * x + CT * y];
  const loss = (x: number, y: number) => { const [u, v] = rot(x, y); return 0.5 * (A * u * u + B * v * v); };
  function grad(x: number, y: number): [number, number] {
    const [u, v] = rot(x, y), gu = A * u, gv = B * v;
    return [CT * gu - ST * gv, ST * gu + CT * gv];
  }
  function readout() {
    const g = grad(...w);
    lossTxt = loss(...w).toFixed(3); gradTxt = Math.hypot(...g).toFixed(3);
  }
  function stepOnce() {
    let g = grad(...w);
    if (noisy) g = [g[0] + gauss() * 1.2, g[1] + gauss() * 1.2];
    trail.push([...w]);
    w = [w[0] - lr * g[0], w[1] - lr * g[1]];
    step++;
    readout();
    const L = loss(...w);
    if (!isFinite(L) || L > 400) { running = false; status = 'Diverge: el paso es tan grande que cada salto cae más arriba que el anterior.'; }
    else if (L < 1e-3 && !noisy) { running = false; status = 'Llegó al mínimo.'; }
    draw();
  }
  function reset() { running = false; w = [...start]; trail = []; step = 0; status = ''; readout(); draw(); }
  function toggle() { if (status.startsWith('Diverge') || status.startsWith('Llegó')) reset(); running = !running; }

  onMount(() => {
    const ctx = setupCanvas(cv, W, H);
    const scr = (p: [number, number]): [number, number] => [O[0] + p[0] * S, O[1] - p[1] * S];
    draw = () => {
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      for (let i = 10; i >= 1; i--) {
        const c = 0.08 * i * i; // nivel de pérdida
        ctx.fillStyle = alpha(P.pred, 0.035);
        ctx.strokeStyle = alpha(P.pred, 0.35); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(O[0], O[1], Math.sqrt((2 * c) / A) * S, Math.sqrt((2 * c) / B) * S, -TH, 0, 7); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = P.ok; ctx.beginPath(); ctx.arc(O[0], O[1], 4, 0, 7); ctx.fill();
      ctx.fillStyle = P.muted; ctx.font = '11px ' + P.mono; ctx.textAlign = 'left';
      ctx.fillText('peso w₁ →', W - 78, H - 8); ctx.fillText('peso w₂ ↑', 6, 14);
      const pts = [...trail, w].map(scr);
      ctx.strokeStyle = P.ctx; ctx.lineWidth = 2; ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      ctx.fillStyle = alpha(P.ctx, 0.6); pts.slice(0, -1).forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill(); });
      const [x, y] = scr(w);
      if (x > -20 && x < W + 20 && y > -20 && y < H + 20) {
        const g = grad(...w), gl = Math.hypot(...g) || 1, [ax, ay] = [-g[0] / gl, g[1] / gl];
        ctx.strokeStyle = P.tgt; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ax * 34, y + ay * 34); ctx.stroke();
        ctx.fillStyle = P.tgt; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('−∇L', x + ax * 46, y + ay * 46 + 4);
        ctx.fillStyle = P.ctx; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill();
      }
    };
    cv.addEventListener('click', (e) => {
      const [x, y] = pointerPos(cv, e);
      start = [(x - O[0]) / S, (O[1] - y) / S];
      reset();
    });
    reset();
    let t = 0;
    return registerDemo(fig, (dt) => {
      if (!running) return;
      t += dt;
      if (t > (reduceMotion ? 0.25 : 0.12)) { t = 0; stepOnce(); }
    }, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>Bajar la montaña a ciegas</h3><span class="hint">toca el mapa para elegir dónde empezar</span></div>
  <div class="flex flex-wrap items-start gap-[18px]">
    <canvas bind:this={cv} aria-label="Curvas de nivel de una pérdida y el camino del descenso por gradiente" class="max-w-full cursor-crosshair"></canvas>
    <div class="readout min-w-0 flex-[1_1_190px]">
      <div>paso <b>{step}</b></div>
      <div>pérdida L(w) <b>{lossTxt}</b></div>
      <div>tamaño del gradiente ‖∇L‖ <b>{gradTxt}</b></div>
      <label class="slider mt-2">tasa de aprendizaje η = <b>{lr.toFixed(2)}</b>
        <input type="range" min="0.02" max="0.32" step="0.01" bind:value={lr} oninput={reset} />
      </label>
      <label class="slider"><input type="checkbox" bind:checked={noisy} onchange={reset} style="width:auto" /> gradiente con ruido (mini-lotes)</label>
      <div class="mt-2 max-w-[30ch] font-body text-[.93rem] text-ink">{status || 'La flecha ámbar es −∇L: la dirección en la que la pérdida baja más rápido desde ese punto.'}</div>
    </div>
  </div>
  <div class="controls">
    <button class="chip go" onclick={toggle}>{running ? 'Pausar' : 'Descender'}</button>
    <button class="chip" onclick={() => { running = false; stepOnce(); }}>Un paso</button>
    <button class="chip" onclick={reset}>Reiniciar</button>
  </div>
  <figcaption>Cada elipse es una curva de nivel: todos sus puntos tienen la misma pérdida. Sube η por encima de 0.28 y verás el zigzag que diverge; bájala a 0.03 y verás lo lento que avanza. Una red real tiene millones de pesos en vez de 2, pero el paso es el mismo: w ← w − η·∇L.</figcaption>
</figure>
