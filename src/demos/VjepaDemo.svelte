<script lang="ts">
  import { onMount } from 'svelte';
  import { P } from '../lib/palette';
  import { setupCanvas, registerDemo } from '../lib/canvas';
  import Chips from '../lib/Chips.svelte';

  const NF = 6, G = 6;
  let mode = $state<'rand' | 'tube'>('rand');
  let visible = $state(0);
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let masks: Set<number>[] = [];
  let draw = () => {};
  const ball = (f: number): [number, number] => [0.5 + f * 0.92, 2.6 + Math.sin(f / 1.6) * 0.5];

  function sample() {
    masks = [];
    if (mode === 'rand') {
      for (let f = 0; f < NF; f++) { const s = new Set<number>(); for (let i = 0; i < G * G; i++) if (Math.random() < 0.6) s.add(i); masks.push(s); }
    } else {
      const s = new Set<number>();
      for (let y = 1; y <= 4; y++) for (let x = 0; x < G; x++) s.add(y * G + x);
      for (let i = 0; i < G * G; i++) if (Math.random() < 0.35) s.add(i);
      for (let f = 0; f < NF; f++) masks.push(s);
    }
    visible = 0;
    for (let f = 0; f < NF; f++) { const [bx, by] = ball(f); if (!masks[f].has(Math.floor(by) * G + Math.floor(bx))) visible++; }
    draw();
  }
  $effect(() => { mode; sample(); });

  onMount(() => {
    const narrow = innerWidth < 640, COLS = narrow ? 3 : 6;
    const fw = narrow ? 96 : 90, gap = narrow ? 14 : 12, cs = fw / G;
    const W = COLS * fw + (COLS - 1) * gap + 12, H = (NF / COLS) * (fw + 30) + 24;
    const ctx = setupCanvas(cv, W, H);
    draw = () => {
      ctx.fillStyle = P.surface; ctx.fillRect(0, 0, W, H);
      for (let f = 0; f < NF; f++) {
        const ox = (f % COLS) * (fw + gap) + 6, top = 30 + Math.floor(f / COLS) * (fw + 30);
        ctx.fillStyle = P.sky; ctx.fillRect(ox, top, fw, fw);
        ctx.fillStyle = P.grass; ctx.fillRect(ox, top + fw * 0.75, fw, fw * 0.25);
        const [bx, by] = ball(f);
        ctx.fillStyle = P.tgt; ctx.beginPath(); ctx.arc(ox + bx * cs, top + by * cs, 6.5, 0, 7); ctx.fill();
        ctx.fillStyle = P.ink; ctx.globalAlpha = 0.82;
        for (const i of masks[f] ?? []) ctx.fillRect(ox + (i % G) * cs, top + Math.floor(i / G) * cs, cs, cs);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = P.line; ctx.lineWidth = 1; ctx.strokeRect(ox + 0.5, top + 0.5, fw - 1, fw - 1);
        ctx.fillStyle = P.muted; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('t = ' + (f + 1), ox + fw / 2, top - 10);
      }
      ctx.fillStyle = P.muted; ctx.textAlign = 'left';
      ctx.fillText(mode === 'tube' ? 'la misma región tapada en todos los fotogramas' : 'cada fotograma con su propia máscara', 6, H - 8);
    };
    sample();
    return registerDemo(fig, undefined, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>¿Puede hacer trampa?</h3><span class="hint">una pelota cruza 6 fotogramas</span></div>
  <canvas bind:this={cv} aria-label="Seis fotogramas con máscara" class="max-w-full"></canvas>
  <div class="flex flex-wrap items-center gap-2">
    <Chips label="Tipo de máscara" bind:value={mode} options={[
      { value: 'rand', label: 'Máscara aleatoria por fotograma' },
      { value: 'tube', label: 'Máscara en tubo (V-JEPA)' },
    ]} />
    <div class="controls"><button class="chip" onclick={sample}>Otra máscara</button></div>
  </div>
  <div class="readout mt-2">
    {#if visible === 0}
      <div>La pelota no se ve en <b>ningún</b> fotograma: hay que inferir su trayectoria.</div>
    {:else}
      <div>La pelota se ve en <b>{visible} de 6</b> fotogramas: la red puede copiar o interpolar desde los vecinos.</div>
    {/if}
  </div>
  <figcaption>Con máscaras independientes, la pelota suele quedar visible en algún fotograma vecino y la red la interpola sin entender nada. Con el tubo, tiene que inferir la trayectoria.</figcaption>
</figure>
