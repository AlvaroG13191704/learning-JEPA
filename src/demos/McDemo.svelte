<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, registerDemo, reduceMotion } from '../lib/canvas';
  import Chips from '../lib/Chips.svelte';

  const W = 560, H = 240;
  let mode = $state<'flow' | 'content'>('flow');
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let draw = () => {};
  $effect(() => { mode; draw(); });

  onMount(() => {
    const ctx = setupCanvas(cv, W, H);
    let carX = 60;
    draw = () => {
      const c = { x: carX, y: 130, w: 120, h: 46 };
      ctx.fillStyle = P.sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = P.grass; ctx.fillRect(0, 150, W, 90);
      ctx.fillStyle = alpha(P.ink, 0.55); ctx.fillRect(0, 168, W, 30);
      ctx.fillStyle = P.tree; ctx.beginPath(); ctx.arc(470, 95, 34, 0, 7); ctx.fill();
      ctx.fillStyle = P.trunk; ctx.fillRect(463, 120, 14, 40);
      ctx.fillStyle = P.ctx; ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h - 14, 8); ctx.fill();
      ctx.fillRect(c.x + 24, c.y - 18, 64, 22);
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(c.x + 26, c.y + c.h - 12, 11, 0, 7); ctx.arc(c.x + 94, c.y + c.h - 12, 11, 0, 7); ctx.fill();
      if (mode === 'content') {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = P.sky; ctx.fillRect(0, 0, W, 150);
        ctx.fillStyle = P.grass; ctx.fillRect(0, 150, W, 18); ctx.fillRect(0, 198, W, 42);
        ctx.fillStyle = P.muted; ctx.fillRect(0, 168, W, 30);
        ctx.fillStyle = P.tree; ctx.fillRect(436, 60, 68, 100);
        ctx.fillStyle = P.tgt; ctx.fillRect(c.x - 4, c.y - 22, c.w + 8, c.h + 24);
        ctx.globalAlpha = 1;
        ctx.font = '700 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = P.ink;
        ctx.fillText('auto', c.x + c.w / 2, c.y - 28); ctx.fillText('árbol', 470, 52); ctx.fillText('cielo', 280, 40); ctx.fillText('camino', 280, 188);
      } else {
        ctx.lineWidth = 1.6;
        for (let y = 18; y < H; y += 24) for (let x = 18; x < W; x += 24) {
          const inCar = x > c.x - 4 && x < c.x + c.w + 4 && y > c.y - 22 && y < c.y + c.h;
          const len = inCar ? 16 : 2;
          ctx.strokeStyle = inCar ? P.pred : alpha(P.ink, 0.25); ctx.fillStyle = ctx.strokeStyle;
          ctx.beginPath(); ctx.moveTo(x - len / 2, y); ctx.lineTo(x + len / 2, y); ctx.stroke();
          ctx.beginPath();
          if (inCar) { ctx.moveTo(x + len / 2 + 3, y); ctx.lineTo(x + len / 2 - 3, y - 4); ctx.lineTo(x + len / 2 - 3, y + 4); }
          else ctx.arc(x, y, 1.3, 0, 7);
          ctx.fill();
        }
        ctx.fillStyle = P.ink; ctx.font = '700 12px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('flujo: 3 px por fotograma →', 12, 20);
      }
    };
    draw();
    return registerDemo(fig, (dt) => { if (reduceMotion) return; carX += dt * 60; if (carX > W + 20) carX = -140; draw(); }, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>Dos lecturas del mismo encoder</h3><span class="hint">cambia de cabeza</span></div>
  <canvas bind:this={cv} aria-label="Escena con un auto en movimiento" class="max-w-full"></canvas>
  <Chips label="Cabeza" bind:value={mode} options={[
    { value: 'flow', label: 'Cabeza de movimiento (flujo óptico)' },
    { value: 'content', label: 'Cabeza de contenido (qué es)' },
  ]} />
  <figcaption>Las flechas son el flujo óptico: hacia dónde se mueve cada región entre dos fotogramas. Los colores son la lectura de contenido. Las dos salen de las mismas representaciones.</figcaption>
</figure>
