<script lang="ts">
  import { onMount } from 'svelte';
  import { P, alpha } from '../lib/palette';
  import { setupCanvas, registerDemo, reduceMotion, rnd } from '../lib/canvas';
  import Chips from '../lib/Chips.svelte';

  /*
    Un bote cruza un río con una corriente que el modelo no ve (la perturbación ε).
    Hecho: con la acción a (rumbo hacia arriba) el bote llegó a z₁.
    Pregunta contrafáctica: ¿dónde habría llegado con la acción a′, con ESA MISMA corriente?
    Reutilizar el residuo: ẑ(a′) = z₁ + μ(z₀, a′) − μ(z₀, a), con μ el modelo factual (aquí μ(z, a) = z + a·h).
  */
  const W = 560, H = 330, S = 58, OX = W / 2, OY = H - 46;
  type Mode = 'uniform' | 'field' | 'scale';
  let mode = $state<Mode>('uniform');
  let alt = $state(140);   // rumbo alternativo en grados (90 = recto hacia arriba)
  let h = $state(1.8);    // duración de la transición
  let showCurrent = $state(false);
  let dist = $state({ u0: 0.55, w0: -0.1, gain: 0.55 });
  let fig: HTMLElement, cv: HTMLCanvasElement;
  let phase = reduceMotion ? 1 : 0;
  let draw = () => {};

  const FACT = 90;
  const dir = (deg: number) => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
  /** Corriente en el punto (x, y). En el modo "campo" depende de la altura: cerca de la orilla de arriba corre más. */
  const current = (x: number, y: number) => {
    const u1 = mode === 'field' ? 0.35 : 0;
    return [dist.u0 + u1 * y - (mode === 'field' ? 0.08 * x : 0), dist.w0];
  };
  /** Simula la física real (Euler fino). En el modo "escala", un fallo oculto del motor multiplica la acción. */
  function sim(deg: number, T: number) {
    const a = dir(deg), g = mode === 'scale' ? dist.gain : 1;
    let x = 0, y = 0;
    const pts: number[][] = [[0, 0]];
    const n = 80, dt = T / n;
    for (let i = 0; i < n; i++) {
      const c = current(x, y);
      x += (g * a[0] + c[0]) * dt; y += (g * a[1] + c[1]) * dt;
      pts.push([x, y]);
    }
    return pts;
  }
  const mu = (deg: number, T: number) => { const a = dir(deg); return [a[0] * T, a[1] * T]; };

  const res = $derived.by(() => {
    mode; dist;
    const fact = sim(FACT, h), truth = sim(alt, h);
    const z1 = fact[fact.length - 1], zt = truth[truth.length - 1];
    const mA = mu(alt, h), mF = mu(FACT, h);
    const naive = mA;
    const rr = [z1[0] + mA[0] - mF[0], z1[1] + mA[1] - mF[1]];
    const errR = Math.hypot(rr[0] - zt[0], rr[1] - zt[1]);
    const errN = Math.hypot(naive[0] - zt[0], naive[1] - zt[1]);
    return { fact, truth, z1, zt, naive, rr, errR, errN };
  });

  function newCurrent() {
    dist = { u0: rnd(-0.8, 0.8), w0: rnd(-0.3, 0.2), gain: rnd(0.35, 0.75) };
    phase = reduceMotion ? 1 : 0;
  }
  $effect(() => { res; showCurrent; phase = reduceMotion ? 1 : phase; draw(); });

  onMount(() => {
    const ctx = setupCanvas(cv, W, H);
    const X = (x: number) => OX + x * S, Y = (y: number) => OY - y * S;
    let flowT = 0;

    function path(pts: number[][], col: string, upto: number, dash: number[] = [], lw = 2.5) {
      const n = Math.max(1, Math.floor((pts.length - 1) * upto));
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(X(pts[0][0]), Y(pts[0][1]));
      for (let i = 1; i <= n; i++) ctx.lineTo(X(pts[i][0]), Y(pts[i][1]));
      ctx.stroke(); ctx.setLineDash([]);
      return pts[n];
    }
    function boat(p: number[], col: string) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(X(p[0]), Y(p[1]), 7, 5, 0, 0, 7); ctx.fill();
    }
    function cross(p: number[], col: string) {
      const x = X(p[0]), y = Y(p[1]);
      ctx.strokeStyle = col; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6); ctx.stroke();
    }
    function ring(p: number[], col: string) {
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 8, 0, 7); ctx.stroke();
    }

    draw = () => {
      const r = res;
      ctx.fillStyle = P.surface; ctx.fillRect(0, 0, W, H);
      // río
      ctx.fillStyle = alpha(P.sky, 0.45); ctx.fillRect(0, 18, W, OY - 6);
      ctx.fillStyle = alpha(P.grass, 0.55); ctx.fillRect(0, OY + 12, W, H - OY); ctx.fillRect(0, 0, W, 18);
      // corriente oculta (líneas de flujo que avanzan)
      if (showCurrent) {
        ctx.strokeStyle = alpha(P.ink, 0.28); ctx.lineWidth = 1.2;
        for (let gy = 0; gy < 6; gy++) for (let gx = -6; gx < 7; gx++) {
          const wx = gx + ((flowT * 0.6) % 1), wy = gy * 1.0 + 0.4;
          const c = current(wx, wy);
          const L = 0.55;
          ctx.beginPath(); ctx.moveTo(X(wx), Y(wy)); ctx.lineTo(X(wx + c[0] * L), Y(wy + c[1] * L)); ctx.stroke();
        }
      } else {
        ctx.fillStyle = alpha(P.ink, 0.35); ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText('corriente: oculta para el modelo', W - 10, 36);
      }
      const t = Math.min(1, phase);
      // acciones
      const aF = dir(FACT), aA = dir(alt);
      ctx.strokeStyle = alpha(P.ink, 0.6); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(aF[0] * 0.9), Y(aF[1] * 0.9)); ctx.stroke();
      ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(aA[0] * 0.9), Y(aA[1] * 0.9)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = P.ink; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('a', X(aF[0] * 1.05), Y(aF[1] * 1.05) - 2);
      ctx.fillText('a′', X(aA[0] * 1.15), Y(aA[1] * 1.15) - 2);

      // predicción ingenua del modelo factual (no sabe nada de la corriente)
      ctx.globalAlpha = t; cross(r.naive, P.muted); ctx.globalAlpha = 1;
      const pf = path(r.fact, P.ctx, t);
      const pt = path(r.truth, P.tgt, t, [], 2);
      boat(pf, P.ctx); boat(pt, P.tgt);
      if (t >= 1) {
        // la corrección: el residuo observado se traslada
        ctx.strokeStyle = alpha(P.pred, 0.8); ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(X(r.z1[0]), Y(r.z1[1])); ctx.lineTo(X(r.rr[0]), Y(r.rr[1])); ctx.stroke(); ctx.setLineDash([]);
        ring(r.rr, P.pred);
      }
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(X(0), Y(0), 4, 0, 7); ctx.fill();
      ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = P.ink; ctx.fillText('z₀', X(0) + 8, Y(0) + 14);
    };
    draw();
    return registerDemo(fig, (dt) => {
      let dirty = false;
      if (phase < 1) { phase = Math.min(1, phase + dt / 1.8); dirty = true; }
      if (showCurrent && !reduceMotion) { flowT += dt; dirty = true; }
      if (dirty) draw();
    }, () => draw());
  });
</script>

<figure class="demo" bind:this={fig}>
  <div class="demo-head"><h3>¿Dónde habría llegado el bote con otro rumbo?</h3><span class="hint">misma corriente, otra acción</span></div>
  <canvas bind:this={cv} aria-label="Bote cruzando un río: trayectoria real, contrafáctica y la corrección por residuo" class="max-w-full"></canvas>
  <div class="legend mt-2">
    <span style="--c:var(--ctx)">lo que pasó (acción a)</span>
    <span style="--c:var(--tgt)">lo que habría pasado con a′ (verdad oculta)</span>
    <span style="--c:var(--muted)">✕ modelo factual solo: μ(z₀, a′)</span>
    <span style="--c:var(--pred)">○ reutilizar el residuo</span>
  </div>
  <div class="controls">
    <label class="slider" for="cfAlt">rumbo alternativo a′ <input id="cfAlt" type="range" min="0" max="180" step="1" bind:value={alt} /> <b>{alt}°</b></label>
    <label class="slider" for="cfH">duración h <input id="cfH" type="range" min="0.25" max="3" step="0.05" bind:value={h} /> <b>{h.toFixed(2)}</b></label>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <Chips label="Tipo de perturbación" bind:value={mode} options={[
      { value: 'uniform', label: 'Corriente uniforme' },
      { value: 'field', label: 'Corriente que cambia en el espacio' },
      { value: 'scale', label: 'Motor averiado (escala la acción)' },
    ]} />
  </div>
  <div class="controls">
    <button class="chip go" onclick={newCurrent}>Otra corriente</button>
    <button class="chip" aria-pressed={showCurrent} onclick={() => (showCurrent = !showCurrent)}>{showCurrent ? 'Ocultar corriente' : 'Mostrar la corriente oculta'}</button>
  </div>
  <div class="readout mt-2">
    <div>error del modelo factual solo <b>{res.errN.toFixed(2)}</b></div>
    <div>error reutilizando el residuo <b style:color={res.errR < 0.15 ? 'var(--ok)' : res.errR > 0.5 ? 'var(--bad)' : 'var(--ink)'}>{res.errR.toFixed(2)}</b></div>
  </div>
  <figcaption>
    {#if mode === 'uniform'}Con una corriente uniforme la acción y la perturbación se suman sin interactuar: el residuo que observaste (z₁ − μ(z₀, a)) es exactamente la corriente, y trasladarlo da la respuesta exacta para cualquier a′ y cualquier h.
    {:else if mode === 'field'}Si la corriente depende de dónde está el bote, otra acción lo lleva por aguas distintas. Para h corto el error es pequeño (el paper lo acota como O(h²)); alarga h y mira cómo crece.
    {:else}Si la perturbación escala la orden (un motor que da solo una fracción de su fuerza), el residuo ya no es una simple suma. Es uno de los casos de fallo que el paper señala: la corrección deja de ser fiable.{/if}
  </figcaption>
</figure>
