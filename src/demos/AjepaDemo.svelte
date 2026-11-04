<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, registerDemo, reduceMotion } from '../lib/canvas';

  const W = 560, H = 220, T = 112, F = 44, cw = W / T, ch = H / F;
  const PT = 8, PF = 4, GT = T / PT, GF = F / PF; // parches de 8×4 celdas → cuadrícula 14×11
  let progress = $state(15);
  let kind = $state('–');
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let mask = new Set<string>();
  let draw = () => {};

  // Espectrograma sintético: armónicos de una voz que sube y baja, con un formante y pausas.
  const spec: number[][] = [];
  for (let t = 0; t < T; t++) {
    const col: number[] = [];
    const f0 = 5 + 2.5 * Math.sin(t / 14) + (t > 60 ? 2 : 0), on = t % 38 < 30 ? 1 : 0.15;
    for (let f = 0; f < F; f++) {
      let v = 0.05 + 0.05 * Math.random();
      for (let k = 1; k < 7; k++) v += on * Math.exp(-((f - f0 * k) ** 2) / 1.2) * (1 / k) * (0.8 + 0.2 * Math.sin(t / 5 + k));
      v += on * 0.25 * Math.exp(-((f - 26 - 4 * Math.sin(t / 9)) ** 2) / 14);
      col.push(Math.min(1, v));
    }
    spec.push(col);
  }

  /** Currículo: cuanto más avanzado el entrenamiento, más probable una máscara de franjas de tiempo o de frecuencia. */
  function sample() {
    const p = progress / 100;
    mask = new Set();
    if (Math.random() < p * 0.9) {
      if (Math.random() < 0.5) {
        kind = 'franjas de tiempo (instantes completos)';
        let n = 0;
        while (n < 5) { const s = Math.floor(Math.random() * (GT - 1)), w = 1 + Math.floor(Math.random() * 2); for (let x = s; x < s + w; x++) for (let y = 0; y < GF; y++) mask.add(x + ',' + y); n += w; }
      } else {
        kind = 'bandas de frecuencia (tonos completos)';
        for (let n = 0; n < 4; n++) { const s = Math.floor(Math.random() * GF); for (let x = 0; x < GT; x++) mask.add(x + ',' + s); }
      }
    } else {
      kind = 'parches aleatorios';
      for (let x = 0; x < GT; x++) for (let y = 0; y < GF; y++) if (Math.random() < 0.4) mask.add(x + ',' + y);
    }
    draw();
  }

  $effect(() => { progress; sample(); });

  onMount(() => {
    const ctx = setupCanvas(cv, W, H);
    draw = () => {
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      for (let t = 0; t < T; t++) for (let f = 0; f < F; f++) { ctx.fillStyle = alpha(P.ctx, Math.pow(spec[t][f], 0.8)); ctx.fillRect(t * cw, H - (f + 1) * ch, cw + 0.4, ch + 0.4); }
      for (const k of mask) {
        const [x, y] = k.split(',').map(Number);
        ctx.fillStyle = P.surface; ctx.fillRect(x * PT * cw, H - (y + 1) * PF * ch, PT * cw, PF * ch);
        ctx.fillStyle = alpha(P.tgt, 0.35); ctx.fillRect(x * PT * cw, H - (y + 1) * PF * ch, PT * cw, PF * ch);
      }
      ctx.strokeStyle = alpha(P.ink, 0.1); ctx.lineWidth = 1;
      for (let x = 1; x < GT; x++) { ctx.beginPath(); ctx.moveTo(x * PT * cw, 0); ctx.lineTo(x * PT * cw, H); ctx.stroke(); }
      for (let y = 1; y < GF; y++) { ctx.beginPath(); ctx.moveTo(0, H - y * PF * ch); ctx.lineTo(W, H - y * PF * ch); ctx.stroke(); }
      ctx.fillStyle = P.ink; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('tiempo →', W - 62, H - 6);
      ctx.save(); ctx.translate(12, 70); ctx.rotate(-Math.PI / 2); ctx.fillText('frecuencia →', 0, 0); ctx.restore();
    };
    sample();
    let acc = 0;
    return registerDemo(fig, (dt) => { if (reduceMotion) return; acc += dt; if (acc > 1.6) { acc = 0; sample(); } }, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>El currículo de máscaras</h3><span class="hint">mueve el entrenamiento</span></div>
  <canvas bind:this={cv} aria-label="Espectrograma con máscaras" class="max-w-full"></canvas>
  <div class="controls">
    <label class="slider" for="ajT">progreso del entrenamiento <input type="range" id="ajT" min="0" max="100" bind:value={progress} /> <b>{progress} %</b></label>
    <button class="chip" onclick={sample}>Otra máscara</button>
  </div>
  <div class="readout mt-2"><div>tipo de máscara: <b>{kind}</b></div></div>
  <figcaption>Eje horizontal: tiempo. Eje vertical: frecuencia (graves abajo). Al avanzar, aumenta la probabilidad de tapar franjas completas de tiempo o de frecuencia.</figcaption>
</figure>
