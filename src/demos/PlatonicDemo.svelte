<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, registerDemo, reduceMotion, gauss } from '../lib/canvas';
  import Chips from '../lib/Chips.svelte';

  const W = 560, H = 300, TRUE_ROT = 2.1;
  const names = ['perro', 'gato', 'auto', 'bici', 'árbol', 'flor', 'mar', 'montaña'];
  const vis = [[-1.3, 0.5], [-1.0, 0.9], [1.1, 0.6], [1.4, 0.2], [-0.2, -1.0], [0.2, -1.2], [0.9, -0.6], [-0.7, -0.3]];
  // Buenas vistas: la misma geometría (más un poco de ruido). Malas vistas: geometría deformada, con conceptos confundidos.
  const good = vis.map((v) => [v[0] + gauss() * 0.05, v[1] + gauss() * 0.05]);
  const bad = vis.map((v, i) => (i === 2 || i === 5 ? [...vis[7]] : [v[0] * 0.5 + gauss() * 0.5, v[1] * 1.3 + gauss() * 0.5]));
  let mode = $state<'good' | 'bad'>('good');
  let rot = $state(0);
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let animTo: number | null = null;
  let draw = () => {};

  const rotp = (p: number[], a: number) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
  const textPts = () => (mode === 'good' ? good : bad).map((p) => rotp(rotp(p, TRUE_ROT), (rot * Math.PI) / 180));
  const score = $derived.by(() => {
    rot; mode;
    const T = textPts();
    let d = 0;
    T.forEach((t, i) => (d += Math.hypot(t[0] - vis[i][0], t[1] - vis[i][1])));
    return Math.max(0, 1 - d / T.length / 1.6);
  });
  /** Procrustes en 2D: el ángulo que mejor alinea las dos nubes tiene forma cerrada. */
  function bestRot() {
    let num = 0, den = 0;
    (mode === 'good' ? good : bad).map((p) => rotp(p, TRUE_ROT)).forEach((b, i) => {
      num += b[0] * vis[i][1] - b[1] * vis[i][0];
      den += b[0] * vis[i][0] + b[1] * vis[i][1];
    });
    return ((Math.atan2(num, den) * 180) / Math.PI + 360) % 360;
  }
  function align() { animTo = bestRot(); if (reduceMotion) { rot = animTo; animTo = null; } }
  $effect(() => { rot; mode; draw(); });

  onMount(() => {
    const ctx = setupCanvas(cv, W, H);
    draw = () => {
      const S = 78, cx = W / 2, cy = H / 2;
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = P.line; ctx.beginPath(); ctx.arc(cx, cy, S, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, 2 * S, 0, 7); ctx.stroke();
      const T = textPts();
      ctx.lineWidth = 1; ctx.strokeStyle = alpha(P.muted, 0.5);
      T.forEach((t, i) => { ctx.beginPath(); ctx.moveTo(cx + vis[i][0] * S, cy - vis[i][1] * S); ctx.lineTo(cx + t[0] * S, cy - t[1] * S); ctx.stroke(); });
      ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
      vis.forEach((v, i) => {
        ctx.fillStyle = P.ctx; ctx.beginPath(); ctx.arc(cx + v[0] * S, cy - v[1] * S, 6, 0, 7); ctx.fill();
        ctx.fillStyle = P.ink; ctx.fillText(names[i], cx + v[0] * S + 9, cy - v[1] * S - 6);
      });
      ctx.fillStyle = P.tgt; T.forEach((t) => ctx.fillRect(cx + t[0] * S - 5, cy - t[1] * S - 5, 10, 10));
      ctx.fillStyle = P.ctx; ctx.fillText('● modelo de visión', 10, 18);
      ctx.fillStyle = P.tgt; ctx.fillText('■ JEPA de texto', 10, 34);
    };
    draw();
    return registerDemo(fig, (dt) => {
      if (animTo === null) return;
      const diff = ((animTo - rot + 540) % 360) - 180;
      if (Math.abs(diff) < 0.5) { rot = animTo; animTo = null; }
      else rot = (rot + diff * Math.min(1, dt * 4) + 360) % 360;
    }, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>Gira una nube para alinearla con la otra</h3><span class="hint">cada concepto tiene dos puntos: visión y texto</span></div>
  <canvas bind:this={cv} aria-label="Dos nubes de conceptos" class="max-w-full"></canvas>
  <div class="controls">
    <label class="slider" for="plRot">rotación del modelo de texto
      <input type="range" id="plRot" min="0" max="360" step="1" value={Math.round(rot)} oninput={(e) => { animTo = null; rot = +e.currentTarget.value; }} />
      <b>{Math.round(rot)}°</b>
    </label>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <Chips label="Vistas" bind:value={mode} options={[
      { value: 'good', label: 'Entrenado con buenas vistas' },
      { value: 'bad', label: 'Entrenado con malas vistas' },
    ]} />
    <div class="controls"><button class="chip go" onclick={align}>Buscar la mejor rotación</button></div>
  </div>
  <div class="readout mt-2"><div>alineación <b style:color={score > 0.85 ? 'var(--ok)' : 'var(--ink)'}>{Math.round(score * 100)} %</b></div></div>
  <figcaption>Con buenas vistas, existe una rotación que pone cada concepto de texto encima de su par visual. Con malas vistas, ninguna rotación lo consigue del todo: la geometría misma es distinta.</figcaption>
</figure>
