<script lang="ts">
  type Mod = 'config' | 'percep' | 'world' | 'cost' | 'mem' | 'actor';
  const info: Record<Mod, [string, string]> = {
    config: ['Configurador', 'El director de orquesta. Según la tarea ("manejar", "cocinar"), ajusta a los demás módulos: qué debe atender la percepción y qué costos importan.'],
    percep: ['Percepción', 'Convierte lo que entra por los sensores en una representación abstracta del estado actual s. En JEPA, es el encoder.'],
    world: ['Modelo del mundo', 'La pieza central. Dado el estado actual y una acción propuesta, predice el estado siguiente, en representación y no en píxeles. Todo lo demás de esta guía trata de cómo entrenar esta pieza.'],
    cost: ['Costo', 'Mide qué tan "malo" es un estado. Tiene una parte fija (intrínseca, como el dolor o el hambre) y una parte aprendida (el crítico), que estima costos futuros.'],
    mem: ['Memoria de corto plazo', 'Guarda estados pasados, actuales y predichos, con su costo. El crítico aprende de ella.'],
    actor: ['Actor', 'Propone secuencias de acciones. En Modo 1 reacciona directo desde la percepción. En Modo 2 imagina con el modelo del mundo y elige las acciones que minimizan el costo, como hará V-JEPA 2-AC.'],
  };
  const boxes: { m: Mod; x: number; y: number; w: number; h: number }[] = [
    { m: 'config', x: 290, y: 20, w: 140, h: 40 },
    { m: 'percep', x: 40, y: 128, w: 160, h: 46 },
    { m: 'world', x: 280, y: 128, w: 160, h: 46 },
    { m: 'cost', x: 520, y: 128, w: 160, h: 46 },
    { m: 'mem', x: 40, y: 236, w: 160, h: 40 },
    { m: 'actor', x: 280, y: 236, w: 160, h: 40 },
  ];
  let sel = $state<Mod>('world');
</script>

<figure class="demo">
  <div class="demo-head"><h3>La arquitectura de seis módulos</h3><span class="hint">toca un módulo</span></div>
  <div class="overflow-x-auto">
    <svg class="diagram min-w-[560px]" viewBox="0 0 720 300" role="img"
      aria-label="Arquitectura de LeCun: percepción alimenta al modelo del mundo; el actor propone acciones; el costo evalúa estados predichos; el configurador ajusta a todos.">
      <defs><marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" /></marker></defs>
      <g font-size="12" fill="currentColor">
        <line x1="360" y1="60" x2="120" y2="128" stroke="var(--muted)" stroke-dasharray="3 3" />
        <line x1="360" y1="60" x2="360" y2="128" stroke="var(--muted)" stroke-dasharray="3 3" />
        <line x1="360" y1="60" x2="600" y2="128" stroke="var(--muted)" stroke-dasharray="3 3" />
        <line x1="200" y1="150" x2="278" y2="150" stroke="currentColor" marker-end="url(#ar2)" /><text x="239" y="142" text-anchor="middle" font-size="10" fill="var(--muted)">estado s</text>
        <line x1="440" y1="150" x2="518" y2="150" stroke="currentColor" marker-end="url(#ar2)" /><text x="479" y="142" text-anchor="middle" font-size="10" fill="var(--muted)">s predicho</text>
        <line x1="360" y1="236" x2="360" y2="174" stroke="currentColor" marker-end="url(#ar2)" /><text x="368" y="208" font-size="10" fill="var(--muted)">acción a</text>
        <path d="M600 174 L600 256 L442 256" fill="none" stroke="currentColor" marker-end="url(#ar2)" /><text x="520" y="270" text-anchor="middle" font-size="10" fill="var(--muted)">energía / costo</text>
        <line x1="120" y1="174" x2="120" y2="234" stroke="currentColor" marker-end="url(#ar2)" /><text x="128" y="208" font-size="10" fill="var(--muted)">guarda</text>
      </g>
      <g font-size="13" font-weight="700">
        {#each boxes as b}
          <g role="button" tabindex="0" aria-pressed={sel === b.m} class="cursor-pointer outline-none"
            onclick={() => (sel = b.m)} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel = b.m; } }}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8"
              fill={sel === b.m ? 'color-mix(in srgb, var(--pred) 16%, transparent)' : 'transparent'}
              stroke={sel === b.m ? 'var(--pred)' : 'var(--ink)'} stroke-width={sel === b.m ? 2.5 : 1.2} />
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 5} text-anchor="middle" fill="var(--ink)">{info[b.m][0]}</text>
          </g>
        {/each}
      </g>
    </svg>
  </div>
  <div class="min-h-[7.5em] max-w-[60ch] text-[.96rem]" aria-live="polite"><b class="font-display">{info[sel][0]}.</b> {info[sel][1]}</div>
</figure>
