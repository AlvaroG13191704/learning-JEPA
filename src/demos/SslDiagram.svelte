<script lang="ts">
  import Chips from '../lib/Chips.svelte';

  // Cuatro familias de aprendizaje auto-supervisado, dibujadas con las mismas piezas.
  type Fam = 'gen' | 'con' | 'nocon' | 'jepa';
  type Box = { x: number; y: number; w: number; t: string; s?: string; c?: string; bold?: boolean };
  type Arrow = { x1: number; y1: number; x2: number; y2: number; c?: string; dash?: boolean; head?: boolean };
  type Label = { x: number; y: number; t: string; c: string };
  const H = 36;
  const fams: Record<Fam, { boxes: Box[]; arrows: Arrow[]; labels: Label[]; text: string; ej: string }> = {
    gen: {
      ej: 'MAE, BEiT, GPT',
      text: 'Tapa una parte y reconstruye los píxeles (o tokens) que faltan. El error se mide en el espacio de entrada. No puede colapsar, porque la respuesta correcta es fija; a cambio, gasta capacidad en detalles impredecibles como la textura exacta del pasto.',
      boxes: [
        { x: 0, y: 30, w: 110, t: 'x enmascarada', c: 'var(--ctx)', bold: true },
        { x: 150, y: 30, w: 100, t: 'encoder' },
        { x: 290, y: 30, w: 100, t: 'decoder' },
        { x: 430, y: 30, w: 120, t: 'píxeles predichos', c: 'var(--pred)', bold: true },
        { x: 630, y: 30, w: 120, t: 'píxeles reales', c: 'var(--tgt)', bold: true },
      ],
      arrows: [
        { x1: 110, y1: 48, x2: 148, y2: 48, head: true }, { x1: 250, y1: 48, x2: 288, y2: 48, head: true }, { x1: 390, y1: 48, x2: 428, y2: 48, head: true },
        { x1: 550, y1: 48, x2: 630, y2: 48, c: 'var(--bad)', dash: true },
      ],
      labels: [{ x: 590, y: 90, t: 'error en píxeles', c: 'var(--bad)' }],
    },
    con: {
      ej: 'SimCLR, MoCo, CLIP',
      text: 'Dos versiones de la misma imagen (aumentos) deben dar vectores cercanos, y vectores de otras imágenes del lote deben quedar lejos. La pérdida (InfoNCE) es una cross-entropy: "de todos los candidatos, ¿cuál es mi pareja?". Los negativos impiden el colapso, pero piden lotes grandes.',
      boxes: [
        { x: 0, y: 0, w: 110, t: 'aumento 1', c: 'var(--ctx)', bold: true },
        { x: 150, y: 0, w: 100, t: 'encoder' },
        { x: 290, y: 0, w: 70, t: 'z₁', c: 'var(--pred)', bold: true },
        { x: 0, y: 70, w: 110, t: 'aumento 2', c: 'var(--tgt)', bold: true },
        { x: 150, y: 70, w: 100, t: 'encoder', s: 'mismos pesos' },
        { x: 290, y: 70, w: 70, t: 'z₂', c: 'var(--tgt)', bold: true },
        { x: 520, y: 34, w: 230, t: 'z de otras imágenes', s: 'negativos', c: 'var(--muted)' },
      ],
      arrows: [
        { x1: 110, y1: 18, x2: 148, y2: 18, head: true }, { x1: 250, y1: 18, x2: 288, y2: 18, head: true },
        { x1: 110, y1: 88, x2: 148, y2: 88, head: true }, { x1: 250, y1: 88, x2: 288, y2: 88, head: true },
        { x1: 325, y1: 36, x2: 325, y2: 70, c: 'var(--ok)', dash: true },
        { x1: 360, y1: 18, x2: 520, y2: 46, c: 'var(--bad)', dash: true },
      ],
      labels: [{ x: 395, y: 58, t: 'acercar', c: 'var(--ok)' }, { x: 450, y: 22, t: 'alejar', c: 'var(--bad)' }],
    },
    nocon: {
      ej: 'BYOL, VICReg, DINO',
      text: 'Igual que el contrastivo, pero sin negativos: solo "que coincidan". Para no colapsar usa otro freno: un maestro EMA con stop-gradient y un predictor solo en la alumna (BYOL), o reglas sobre la varianza y covarianza del lote (VICReg).',
      boxes: [
        { x: 0, y: 0, w: 110, t: 'aumento 1', c: 'var(--ctx)', bold: true },
        { x: 150, y: 0, w: 110, t: 'enc. alumna' },
        { x: 300, y: 0, w: 100, t: 'predictor', c: 'var(--pred)' },
        { x: 0, y: 70, w: 110, t: 'aumento 2', c: 'var(--tgt)', bold: true },
        { x: 150, y: 70, w: 110, t: 'enc. maestro', s: 'EMA · sin gradiente' },
        { x: 440, y: 35, w: 120, t: 'que coincidan', c: 'var(--ok)', bold: true },
        { x: 600, y: 35, w: 150, t: 'o VICReg / SIGReg', s: 'freno explícito', c: 'var(--muted)' },
      ],
      arrows: [
        { x1: 110, y1: 18, x2: 148, y2: 18, head: true }, { x1: 260, y1: 18, x2: 298, y2: 18, head: true },
        { x1: 110, y1: 88, x2: 148, y2: 88, head: true },
        { x1: 400, y1: 18, x2: 440, y2: 45, c: 'var(--ok)', head: true }, { x1: 260, y1: 88, x2: 440, y2: 62, c: 'var(--ok)', head: true },
      ],
      labels: [],
    },
    jepa: {
      ej: 'I-JEPA, V-JEPA, LeJEPA',
      text: 'En vez de dos versiones de lo mismo, dos partes distintas: el contexto visible y una región oculta. El predictor recibe además dónde está lo oculto y adivina su representación. El error se mide en el espacio latente, como en el no contrastivo, pero la tarea es predecir, no coincidir.',
      boxes: [
        { x: 0, y: 0, w: 110, t: 'contexto visible', c: 'var(--ctx)', bold: true },
        { x: 150, y: 0, w: 110, t: 'enc. contexto' },
        { x: 300, y: 0, w: 110, t: 'predictor', s: '+ posición oculta', c: 'var(--pred)' },
        { x: 450, y: 0, w: 70, t: 'ŝ', c: 'var(--pred)', bold: true },
        { x: 0, y: 70, w: 110, t: 'región oculta', c: 'var(--tgt)', bold: true },
        { x: 150, y: 70, w: 110, t: 'enc. objetivo', s: 'EMA · sin gradiente' },
        { x: 450, y: 70, w: 70, t: 's', c: 'var(--tgt)', bold: true },
      ],
      arrows: [
        { x1: 110, y1: 18, x2: 148, y2: 18, head: true }, { x1: 260, y1: 18, x2: 298, y2: 18, head: true }, { x1: 410, y1: 18, x2: 448, y2: 18, head: true },
        { x1: 110, y1: 88, x2: 148, y2: 88, head: true }, { x1: 260, y1: 88, x2: 448, y2: 88, head: true },
        { x1: 485, y1: 36, x2: 485, y2: 70, c: 'var(--ok)', dash: true },
      ],
      labels: [{ x: 620, y: 58, t: 'error en representaciones', c: 'var(--ok)' }],
    },
  };
  let fam = $state<Fam>('jepa');
  let d = $derived(fams[fam]);
</script>

<figure class="demo">
  <div class="demo-head"><h3>Cuatro familias, las mismas piezas</h3><span class="hint">ejemplos: {d.ej}</span></div>
  <div class="overflow-x-auto">
    <svg class="diagram min-w-[600px]" viewBox="-4 -6 764 128" role="img" aria-label="Esquema de la familia elegida de aprendizaje auto-supervisado">
      <defs><marker id="ssl-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" /></marker></defs>
      <g font-size="12" fill="currentColor">
        {#each d.arrows as a}
          <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={a.c ?? 'currentColor'} stroke-width={a.dash ? 2 : 1.2}
            stroke-dasharray={a.dash ? '4 3' : undefined} marker-end={a.head ? 'url(#ssl-ar)' : undefined} />
        {/each}
        {#each d.boxes as b}
          <rect x={b.x} y={b.y} width={b.w} height={H} rx="6" fill="var(--surface)" stroke={b.c ?? 'currentColor'} stroke-width={b.bold ? 2 : 1} />
          <text x={b.x + b.w / 2} y={b.y + (b.s ? 16 : 22)} text-anchor="middle">{b.t}</text>
          {#if b.s}<text x={b.x + b.w / 2} y={b.y + 30} text-anchor="middle" font-size="10" fill="var(--muted)">{b.s}</text>{/if}
        {/each}
        {#each d.labels as l}<text x={l.x} y={l.y} text-anchor="middle" font-weight="700" fill={l.c}>{l.t}</text>{/each}
      </g>
    </svg>
  </div>
  <p class="mt-3 max-w-[70ch] font-body text-[.98rem]">{d.text}</p>
  <Chips label="Familia" bind:value={fam} options={[
    { value: 'gen', label: 'Generativo' },
    { value: 'con', label: 'Contrastivo' },
    { value: 'nocon', label: 'No contrastivo' },
    { value: 'jepa', label: 'Predictivo (JEPA)' },
  ]} />
  <figcaption>Azul es lo que entra, ámbar es el blanco, violeta es lo que produce la red y verde o rojo es dónde se calcula el error. Fíjate en qué cambia de un esquema a otro: qué se compara y en qué espacio.</figcaption>
</figure>
