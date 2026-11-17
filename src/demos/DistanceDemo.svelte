<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, pointerPos, registerDemo } from '../lib/canvas';
  import Chips from '../lib/Chips.svelte';

  // Dos vectores en un espacio latente de 2 dimensiones: la representación real s y la predicha ŝ.
  type Mode = 'l2' | 'l1' | 'cos';
  const W = 380, H = 320, S = 52; // S = píxeles por unidad
  const O: [number, number] = [W / 2 - 40, H / 2 + 40]; // origen en pantalla
  const msgs: Record<Mode, string> = {
    l2: 'L2 es la distancia "en línea recta". Todos los puntos a la misma distancia L2 de s forman un círculo. Al elevarla al cuadrado (como I-JEPA), un error doble pesa cuatro veces más.',
    l1: 'L1 suma los errores de cada dimensión por separado, como caminar por calles en cuadrícula. Los puntos a igual distancia L1 forman un rombo. Un error grande en una sola dimensión no domina tanto: por eso V-JEPA y V-JEPA 2-AC usan L1.',
    cos: 'El coseno ignora la longitud y solo mira el ángulo entre las flechas desde el origen. 1 = misma dirección, 0 = perpendiculares, −1 = opuestas. Es lo que usa LLM-JEPA.',
  };
  let mode = $state<Mode>('l2');
  let s: [number, number] = [1.6, 1.2];
  let p = $state<[number, number]>([0.4, 2.0]);
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let draw = () => {};

  const toScr = (v: [number, number]): [number, number] => [O[0] + v[0] * S, O[1] - v[1] * S];
  const toLat = (x: number, y: number): [number, number] => [(x - O[0]) / S, (O[1] - y) / S];
  let dx = $derived(p[0] - s[0]), dy = $derived(p[1] - s[1]);
  let l1 = $derived(Math.abs(dx) + Math.abs(dy));
  let l2 = $derived(Math.hypot(dx, dy));
  let cos = $derived((p[0] * s[0] + p[1] * s[1]) / (Math.hypot(...p) * Math.hypot(...s) || 1));

  $effect(() => { void p; void mode; draw(); });

  onMount(() => {
    const ctx = setupCanvas(cv, W, H);
    const arrow = (a: [number, number], b: [number, number], c: string, w = 2) => {
      const [x1, y1] = toScr(a), [x2, y2] = toScr(b), ang = Math.atan2(y2 - y1, x2 - x1);
      ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 9 * Math.cos(ang - 0.4), y2 - 9 * Math.sin(ang - 0.4));
      ctx.lineTo(x2 - 9 * Math.cos(ang + 0.4), y2 - 9 * Math.sin(ang + 0.4)); ctx.fill();
    };
    draw = () => {
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      for (let x = O[0] % S; x < W; x += S) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = O[1] % S; y < H; y += S) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = P.muted; ctx.beginPath(); ctx.moveTo(O[0], 0); ctx.lineTo(O[0], H); ctx.moveTo(0, O[1]); ctx.lineTo(W, O[1]); ctx.stroke();
      ctx.fillStyle = P.muted; ctx.font = '11px ' + P.mono; ctx.textAlign = 'left';
      ctx.fillText('dim 1 →', W - 62, O[1] - 6); ctx.fillText('dim 2 ↑', O[0] + 6, 14);
      const [sx, sy] = toScr(s), [px, py] = toScr(p);

      if (mode === 'l2') {
        ctx.fillStyle = alpha(P.pred, 0.08); ctx.strokeStyle = alpha(P.pred, 0.6); ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.arc(sx, sy, l2 * S, 0, 7); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = P.pred; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(px, py); ctx.stroke();
      } else if (mode === 'l1') {
        const r = l1 * S;
        ctx.fillStyle = alpha(P.ctx, 0.08); ctx.strokeStyle = alpha(P.ctx, 0.6); ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(sx + r, sy); ctx.lineTo(sx, sy - r); ctx.lineTo(sx - r, sy); ctx.lineTo(sx, sy + r); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = P.ctx; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(px, sy); ctx.lineTo(px, py); ctx.stroke();
      } else {
        arrow([0, 0], s, P.tgt, 2.5); arrow([0, 0], p, P.pred, 2.5);
        const a1 = Math.atan2(-s[1], s[0]), a2 = Math.atan2(-p[1], p[0]);
        ctx.strokeStyle = P.ok; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(O[0], O[1], 34, Math.min(a1, a2), Math.max(a1, a2)); ctx.stroke();
        ctx.fillStyle = P.ok; ctx.font = '700 12px ' + P.mono; ctx.fillText('θ', O[0] + 40 * Math.cos((a1 + a2) / 2), O[1] + 40 * Math.sin((a1 + a2) / 2) + 4);
      }
      ctx.fillStyle = P.tgt; ctx.beginPath(); ctx.arc(sx, sy, 8, 0, 7); ctx.fill();
      ctx.fillStyle = P.pred; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fill();
      ctx.fillStyle = P.surface; ctx.beginPath(); ctx.arc(px, py, 3.5, 0, 7); ctx.fill();
      ctx.font = '700 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = P.tgt; ctx.fillText('s (real)', sx, sy + 24);
      ctx.fillStyle = P.pred; ctx.fillText('ŝ (predicha)', px, py - 16);
    };
    let dragging = false;
    const move = (e: PointerEvent) => {
      const [x, y] = pointerPos(cv, e);
      p = toLat(Math.max(8, Math.min(W - 8, x)), Math.max(8, Math.min(H - 8, y)));
    };
    cv.addEventListener('pointerdown', (e) => { dragging = true; cv.setPointerCapture(e.pointerId); move(e); });
    cv.addEventListener('pointermove', (e) => { if (dragging) move(e); });
    cv.addEventListener('pointerup', () => (dragging = false));
    draw();
    return registerDemo(fig, undefined, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>Tres maneras de medir "qué tan lejos"</h3><span class="hint">arrastra el punto violeta</span></div>
  <div class="flex flex-wrap items-start gap-[18px]">
    <canvas bind:this={cv} aria-label="Dos vectores en un plano y la distancia entre ellos" class="max-w-full cursor-crosshair touch-none"></canvas>
    <div class="readout min-w-0 flex-[1_1_200px]">
      <div>s = (<b>{s[0].toFixed(1)}</b>, <b>{s[1].toFixed(1)}</b>)   ŝ = (<b>{p[0].toFixed(2)}</b>, <b>{p[1].toFixed(2)}</b>)</div>
      <div>error ŝ − s = (<b>{dx.toFixed(2)}</b>, <b>{dy.toFixed(2)}</b>)</div>
      <div class={mode === 'l1' ? 'text-ink' : ''}>L1 = |{dx.toFixed(2)}| + |{dy.toFixed(2)}| = <b>{l1.toFixed(2)}</b></div>
      <div class={mode === 'l2' ? 'text-ink' : ''}>L2 = √({dx.toFixed(2)}² + {dy.toFixed(2)}²) = <b>{l2.toFixed(2)}</b></div>
      <div>L2² (error cuadrático) = <b>{(l2 * l2).toFixed(2)}</b></div>
      <div class={mode === 'cos' ? 'text-ink' : ''}>cos(θ) = <b>{cos.toFixed(3)}</b></div>
      <div class="mt-2 max-w-[34ch] font-body text-[.95rem] text-ink">{msgs[mode]}</div>
    </div>
  </div>
  <Chips label="Medida" bind:value={mode} options={[
    { value: 'l2', label: 'L2 (euclídea)' },
    { value: 'l1', label: 'L1 (Manhattan)' },
    { value: 'cos', label: 'Similitud coseno' },
  ]} />
  <figcaption>Aquí hay 2 dimensiones para poder dibujarlas. Un ViT-Small produce vectores de 384 dimensiones y un ViT-Huge de 1280, pero las fórmulas son idénticas: solo hay más términos en la suma.</figcaption>
</figure>
