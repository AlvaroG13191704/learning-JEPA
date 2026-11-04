<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, registerDemo, reduceMotion } from '../lib/canvas';
  import Chips from '../lib/Chips.svelte';

  const W = 560, H = 240;
  type Pair = { t: string; c: string; a: [number, number]; b: [number, number]; cb: [number, number]; tb: [number, number] };
  const pairs: Pair[] = [
    { t: 'contiene un número', c: '.*[0-9].*', a: [110, 70], b: [430, 190] },
    { t: "empieza con 'hola'", c: 'hola.*', a: [420, 60], b: [130, 180] },
    { t: 'termina en punto', c: '.*\\.', a: [270, 200], b: [300, 40] },
  ].map((p) => ({ ...p, a: p.a as [number, number], b: p.b as [number, number], cb: [...p.b] as [number, number], tb: [...p.b] as [number, number] }));
  let mode = $state<'ntp' | 'jepa'>('jepa');
  let fig: HTMLElement, cv: HTMLCanvasElement;

  $effect(() => {
    for (const p of pairs) p.tb = mode === 'jepa' ? [p.a[0] + 34, p.a[1] + 20] : [...p.b];
  });

  onMount(() => {
    for (const p of pairs) p.cb = [...p.tb];
    const ctx = setupCanvas(cv, W, H);
    function draw() {
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      ctx.font = '11px ' + P.mono;
      for (const p of pairs) {
        ctx.strokeStyle = alpha(P.pred, mode === 'jepa' ? 0.9 : 0.25); ctx.lineWidth = 2; ctx.setLineDash(mode === 'jepa' ? [] : [4, 4]);
        ctx.beginPath(); ctx.moveTo(p.a[0], p.a[1]); ctx.lineTo(p.cb[0] - 6, p.cb[1] - 4); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = P.ctx; ctx.beginPath(); ctx.arc(p.a[0], p.a[1], 7, 0, 7); ctx.fill();
        ctx.fillStyle = P.tgt; ctx.fillRect(p.cb[0] - 6, p.cb[1] - 6, 12, 12);
        ctx.fillStyle = P.ink; ctx.textAlign = 'left'; ctx.fillText(p.t, p.a[0] + 11, p.a[1] - 9);
        ctx.fillStyle = P.muted; ctx.fillText(p.c, p.cb[0] + 10, p.cb[1] + 16);
      }
    }
    function tick(dt: number) {
      let moved = false;
      for (const p of pairs) for (let i = 0; i < 2; i++) {
        const d = p.tb[i] - p.cb[i];
        if (Math.abs(d) > 0.3) { moved = true; p.cb[i] += reduceMotion ? d : d * Math.min(1, dt * 3); }
      }
      if (moved) draw();
    }
    draw();
    return registerDemo(fig, tick, draw);
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>Dos vistas, un significado</h3><span class="hint">compara los dos entrenamientos</span></div>
  <div class="mb-3 grid grid-cols-1 gap-2.5 min-[521px]:grid-cols-2">
    <div class="min-w-0 rounded-[10px] border border-line bg-paper px-3 py-2.5"><small class="block font-mono text-[.7rem] text-muted">vista 1 · texto</small>"líneas que contienen un número"</div>
    <div class="min-w-0 rounded-[10px] border border-line bg-paper px-3 py-2.5"><small class="block font-mono text-[.7rem] text-muted">vista 2 · código</small><code class="font-mono text-[.9rem] wrap-anywhere">.*[0-9].*</code></div>
  </div>
  <canvas bind:this={cv} aria-label="Embeddings de pares texto y código" class="max-w-full"></canvas>
  <Chips label="Entrenamiento" bind:value={mode} options={[
    { value: 'ntp', label: 'Solo siguiente token' },
    { value: 'jepa', label: 'Siguiente token + JEPA' },
  ]} />
  <figcaption>Círculos azules: embeddings del texto. Cuadrados ámbar: embeddings del código. La flecha violeta es el predictor. Con la pérdida JEPA, cada par queda conectado en el espacio de representaciones.</figcaption>
</figure>
