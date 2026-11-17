<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, pointerPos, registerDemo } from '../lib/canvas';
  import { drawScene, patchConcepts, CATS } from '../lib/scene';
  import Chips from '../lib/Chips.svelte';

  // Atención de juguete: cada parche es un vector (qué conceptos contiene + dónde está).
  // El parche elegido hace de consulta (query) y reparte 100 % de atención con softmax.
  type Mix = 'contenido' | 'ambos' | 'posicion';
  const W = 320, G = 8, CS = W / G;
  let mix = $state<Mix>('ambos'), temp = $state(0.5);
  let q = $state(5 * G + 4); // parche consulta (fila 5, columna 4)
  let top = $state<{ i: number; w: number }[]>([]), ent = $state('–'), qLabel = $state('');
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let draw = () => {};

  const concepts = Array.from({ length: G * G }, (_, i) => patchConcepts(i % G, Math.floor(i / G), G, W));
  const dominant = (i: number) => CATS[concepts[i].indexOf(Math.max(...concepts[i]))];

  function weights() {
    const qx = q % G, qy = Math.floor(q / G);
    const scores = concepts.map((k, i) => {
      const content = k.reduce((s, v, c) => s + v * concepts[q][c], 0); // producto punto q·k
      const d2 = ((i % G) - qx) ** 2 + (Math.floor(i / G) - qy) ** 2;
      const pos = -d2 / 8;
      const sc = mix === 'contenido' ? 3 * content : mix === 'posicion' ? pos : 3 * content + pos;
      return sc / temp;
    });
    const m = Math.max(...scores), e = scores.map((s) => Math.exp(s - m)), Z = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / Z);
  }

  $effect(() => { void mix; void temp; void q; draw(); });

  onMount(() => {
    const ctx = setupCanvas(cv, W, W);
    draw = () => {
      const w = weights(), wmax = Math.max(...w);
      drawScene(ctx, W);
      for (let i = 0; i < G * G; i++) {
        const x = (i % G) * CS, y = Math.floor(i / G) * CS;
        ctx.fillStyle = alpha(P.bg, 0.82 * (1 - Math.sqrt(w[i] / wmax)));
        ctx.fillRect(x, y, CS, CS);
      }
      ctx.strokeStyle = alpha(P.ink, 0.18); ctx.lineWidth = 1;
      for (let k = 1; k < G; k++) { ctx.beginPath(); ctx.moveTo(k * CS, 0); ctx.lineTo(k * CS, W); ctx.moveTo(0, k * CS); ctx.lineTo(W, k * CS); ctx.stroke(); }
      ctx.strokeStyle = P.pred; ctx.lineWidth = 3; ctx.strokeRect((q % G) * CS + 1.5, Math.floor(q / G) * CS + 1.5, CS - 3, CS - 3);
      const ranked = w.map((v, i) => ({ i, w: v })).sort((a, b) => b.w - a.w);
      const best = ranked.slice(0, 4);
      top = best;
      ctx.font = '700 10px ' + P.mono; ctx.textAlign = 'center';
      for (const t of best) {
        const x = (t.i % G) * CS + CS / 2, y = Math.floor(t.i / G) * CS + CS / 2 + 4;
        ctx.fillStyle = alpha(P.surface, 0.85); ctx.fillRect(x - 15, y - 11, 30, 15);
        ctx.fillStyle = P.ink; ctx.fillText((t.w * 100).toFixed(0) + '%', x, y);
      }
      ent = (-w.reduce((s, v) => s + (v > 0 ? v * Math.log2(v) : 0), 0)).toFixed(2);
      qLabel = dominant(q);
    };
    cv.addEventListener('click', (e) => {
      const [x, y] = pointerPos(cv, e);
      q = Math.min(G - 1, Math.floor(y / CS)) * G + Math.min(G - 1, Math.floor(x / CS));
    });
    draw();
    return registerDemo(fig, undefined, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>¿A quién mira este parche?</h3><span class="hint">toca un parche para que sea la consulta</span></div>
  <div class="flex flex-wrap items-start gap-[18px]">
    <canvas bind:this={cv} aria-label="Pesos de atención de un parche sobre los demás" class="max-w-full cursor-pointer"></canvas>
    <div class="readout min-w-0 flex-[1_1_200px]">
      <div>consulta: parche de <b>{qLabel}</b></div>
      {#each top as t}<div>→ parche de {dominant(t.i)} <b>{(t.w * 100).toFixed(1)} %</b></div>{/each}
      <div>entropía de la atención <b>{ent} bits</b> <span>(máx. 6 = mirar los 64 por igual)</span></div>
      <label class="slider mt-2">temperatura <b class="text-ink">{temp.toFixed(2)}</b>
        <input type="range" min="0.1" max="2" step="0.05" bind:value={temp} /></label>
      <div class="mt-1 max-w-[32ch] font-body text-[.93rem] text-ink">Los pesos siempre suman 100 %: son una softmax. La salida del parche es el promedio de los "valores" de todos, ponderado por estos pesos.</div>
    </div>
  </div>
  <Chips label="Qué compara la atención" bind:value={mix} options={[
    { value: 'contenido', label: 'Solo contenido' },
    { value: 'ambos', label: 'Contenido + posición' },
    { value: 'posicion', label: 'Solo posición' },
  ]} />
  <figcaption>Una imagen de 320 px cortada en 8×8 parches de 40 px (un ViT real usa 16 px). Aquí el vector de cada parche es "cuánto cielo, sol, árbol, casa y pasto tiene", más su posición; en un ViT esos vectores los aprende la red. Baja la temperatura y la atención se concentra (poca entropía); súbela y se reparte.</figcaption>
</figure>
