<script lang="ts">
  import { onMount } from 'svelte';
  import { P } from '../lib/palette';
  import { setupCanvas, registerDemo, reduceMotion, gauss } from '../lib/canvas';
  import Chips from '../lib/Chips.svelte';

  type Mode = 'none' | 'byol' | 'vicreg';
  const W = 420, H = 300, N = 72;
  const centers = [[-1.1, -0.5], [1.1, -0.4], [0.0, 1.1]];
  const msgs: Record<Mode, string> = {
    none: 'Sin nada que lo impida, todos los puntos caen al mismo lugar. La pérdida llega a cero y la red no distingue un perro de un auto.',
    byol: 'El maestro EMA va un paso atrás: la alumna persigue un blanco que se mueve despacio y no logra colapsar. Las clases se separan, con algo de retraso.',
    vicreg: 'Varianza y covarianza obligan a usar todo el espacio. Las clases quedan separadas y las dos dimensiones aportan información.',
  };
  let mode = $state<Mode>('vicreg');
  let variance = $state('–'), rank = $state('–');
  let fig: HTMLElement, cv: HTMLCanvasElement;

  const pts = Array.from({ length: N }, (_, i) => {
    const c = i % 3;
    return { c, x: centers[c][0] + gauss() * 0.35, y: centers[c][1] + gauss() * 0.35, tx: 0, ty: 0, j: [gauss() * 0.35, gauss() * 0.35] };
  });

  $effect(() => {
    for (const p of pts) {
      if (mode === 'none') { p.tx = 0.02 * p.j[0]; p.ty = 0.02 * p.j[1]; }
      else { p.tx = centers[p.c][0] + p.j[0]; p.ty = centers[p.c][1] + p.j[1]; }
    }
  });

  /** Varianza promedio y rango efectivo (exp de la entropía de los autovalores normalizados de la covarianza). */
  function metrics() {
    let mx = 0, my = 0;
    pts.forEach((p) => { mx += p.x; my += p.y; }); mx /= N; my /= N;
    let a = 0, b = 0, c = 0;
    pts.forEach((p) => { const dx = p.x - mx, dy = p.y - my; a += dx * dx; b += dx * dy; c += dy * dy; });
    a /= N; b /= N; c /= N;
    const tr = a + c, det = a * c - b * b, disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
    const l1 = tr / 2 + disc, l2 = Math.max(1e-9, tr / 2 - disc), s = l1 + l2, p1 = l1 / s, p2 = l2 / s;
    variance = (tr / 2).toFixed(3);
    rank = tr < 1e-2 ? '≈ 0 (colapso)' : Math.exp(-(p1 * Math.log(p1) + p2 * Math.log(p2))).toFixed(2);
  }

  onMount(() => {
    const ctx = setupCanvas(cv, W, H);
    function draw() {
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W / 2, 10); ctx.lineTo(W / 2, H - 10); ctx.moveTo(10, H / 2); ctx.lineTo(W - 10, H / 2); ctx.stroke();
      const cols = [P.ctx, P.tgt, P.ok], S = 80;
      for (const p of pts) { ctx.fillStyle = cols[p.c]; ctx.beginPath(); ctx.arc(W / 2 + p.x * S, H / 2 - p.y * S, 4.5, 0, 7); ctx.fill(); }
      ctx.fillStyle = P.muted; ctx.font = '11px ' + P.mono; ctx.textAlign = 'left';
      ctx.fillText('dimensión 1 →', W - 100, H / 2 - 6); ctx.fillText('dimensión 2 ↑', W / 2 + 6, 20);
      metrics();
    }
    function tick(dt: number) {
      const rate = reduceMotion ? 1 : (mode === 'byol' ? 1.4 : 3.2) * dt;
      let moved = false;
      for (const p of pts) {
        const dx = p.tx - p.x, dy = p.ty - p.y;
        if (Math.abs(dx) + Math.abs(dy) > 1e-4) { moved = true; p.x += dx * Math.min(1, rate); p.y += dy * Math.min(1, rate); }
      }
      if (moved) draw();
    }
    draw();
    return registerDemo(fig, tick, draw);
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>Mira el colapso en vivo</h3><span class="hint">cada punto es una imagen; el color es su clase real (perro, auto, árbol)</span></div>
  <div class="flex flex-wrap items-start gap-[18px]">
    <canvas bind:this={cv} aria-label="Espacio de representaciones en 2D" class="max-w-full"></canvas>
    <div class="readout min-w-0 flex-[1_1_180px]">
      <div>varianza promedio <b>{variance}</b></div>
      <div>rango efectivo <b>{rank}</b> <span>(máx. 2)</span></div>
      <div class="mt-2 max-w-[30ch] font-body text-[.95rem] text-ink">{msgs[mode]}</div>
    </div>
  </div>
  <Chips label="Método" bind:value={mode} options={[
    { value: 'none', label: 'Solo "que coincidan"' },
    { value: 'byol', label: '+ maestro EMA (BYOL)' },
    { value: 'vicreg', label: '+ varianza y covarianza (VICReg)' },
  ]} />
  <figcaption>"Rango efectivo" mide cuántas dimensiones usa realmente la red: 1 significa que todo cayó en una línea o un punto. Lo calculamos en vivo con los autovalores de la covarianza de estos puntos.</figcaption>
</figure>
