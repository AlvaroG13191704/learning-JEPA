<script lang="ts">
  import Chips from '../lib/Chips.svelte';

  // Predicción de la siguiente palabra: p = la verdad, q = lo que cree el modelo (softmax de sus logits).
  type Truth = 'seguro' | 'dudoso' | 'uniforme';
  const words = ['techo', 'árbol', 'sofá', 'avión'];
  const truths: Record<Truth, number[]> = {
    seguro: [1, 0, 0, 0],
    dudoso: [0.5, 0.3, 0.15, 0.05],
    uniforme: [0.25, 0.25, 0.25, 0.25],
  };
  let truth = $state<Truth>('seguro');
  let logits = $state([0.5, 0.8, 0, -1]);

  const log2 = (x: number) => Math.log(x) / Math.LN2;
  let p = $derived(truths[truth]);
  let q = $derived.by(() => {
    const m = Math.max(...logits), e = logits.map((z) => Math.exp(z - m)), s = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / s);
  });
  let H = $derived(-p.reduce((s, pi) => s + (pi > 0 ? pi * log2(pi) : 0), 0));
  let CE = $derived(-p.reduce((s, pi, i) => s + (pi > 0 ? pi * log2(q[i]) : 0), 0));
  let KL = $derived(CE - H);
  const pct = (v: number) => (v * 100).toFixed(0) + ' %';
</script>

<figure class="demo">
  <div class="demo-head"><h3>"El gato se subió al ___"</h3><span class="hint">mueve los logits del modelo y mira cómo cambia la pérdida</span></div>
  <div class="grid gap-x-8 gap-y-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <div class="grid gap-2.5">
      {#each words as w, i}
        <div class="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-2 font-mono text-[.78rem]">
          <span class="text-ink">{w}</span>
          <div class="grid gap-1">
            <div class="flex items-center gap-2"><i class="block h-2.5 rounded-sm bg-tgt transition-[width]" style:width="{p[i] * 75}%"></i><span class="whitespace-nowrap text-muted">p {pct(p[i])}</span></div>
            <div class="flex items-center gap-2"><i class="block h-2.5 rounded-sm bg-pred transition-[width]" style:width="{q[i] * 75}%"></i><span class="whitespace-nowrap text-muted">q {pct(q[i])}</span></div>
          </div>
        </div>
      {/each}
      <div class="legend mt-1"><span style="--c:var(--tgt)">p: la verdad</span><span style="--c:var(--pred)">q: lo que predice el modelo</span></div>
    </div>
    <div class="grid content-start gap-1">
      {#each words as w, i}
        <label class="slider">logit "{w}" <b class="text-ink">{logits[i].toFixed(1)}</b>
          <input type="range" min="-4" max="4" step="0.1" bind:value={logits[i]} /></label>
      {/each}
    </div>
  </div>
  <div class="readout mt-4 md:grid-cols-3">
    <div>entropía H(p) <b>{H.toFixed(2)} bits</b><br /><span>la incertidumbre propia del problema</span></div>
    <div>cross-entropy H(p, q) <b>{CE.toFixed(2)} bits</b><br /><span>la sorpresa media del modelo: la pérdida</span></div>
    <div>KL(p ‖ q) = H(p,q) − H(p) <b>{KL.toFixed(2)} bits</b><br /><span>lo que sobra por creer q en vez de p</span></div>
  </div>
  <Chips label="La verdad" bind:value={truth} options={[
    { value: 'seguro', label: 'Respuesta única (one-hot)' },
    { value: 'dudoso', label: 'Varias respuestas posibles' },
    { value: 'uniforme', label: 'Cualquiera vale' },
  ]} />
  <figcaption>Con una respuesta única, H(p) = 0 y la cross-entropy se reduce a −log₂ q(techo): la sorpresa del modelo ante la palabra correcta. Ninguna q baja la cross-entropy por debajo de H(p): la KL nunca es negativa, y vale 0 solo cuando q = p. Aquí usamos bits (log₂); PyTorch usa nats (logaritmo natural), que es lo mismo multiplicado por 0.693.</figcaption>
</figure>
