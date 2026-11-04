<script lang="ts">
  // Diagrama estático: generativo frente a JEPA.
</script>

<figure class="demo">
  <div class="demo-head"><h3>Dónde se mide el error</h3><span class="hint">esa es toda la diferencia</span></div>
  <div class="overflow-x-auto">
    <svg class="diagram min-w-[560px]" viewBox="0 0 760 300" role="img" aria-label="Comparación: un modelo generativo compara píxeles; JEPA compara representaciones.">
      <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" /></marker></defs>
      <text x="0" y="22" font-size="13" font-weight="700" fill="currentColor">Generativo (MAE, GPT)</text>
      <g font-size="12" fill="currentColor">
        <rect x="0" y="40" width="90" height="40" rx="6" fill="none" stroke="var(--ctx)" stroke-width="2" /><text x="45" y="64" text-anchor="middle">x visible</text>
        <line x1="90" y1="60" x2="138" y2="60" stroke="currentColor" marker-end="url(#ar)" />
        <rect x="140" y="40" width="100" height="40" rx="6" fill="none" stroke="currentColor" /><text x="190" y="64" text-anchor="middle">encoder</text>
        <line x1="240" y1="60" x2="288" y2="60" stroke="currentColor" marker-end="url(#ar)" />
        <rect x="290" y="40" width="100" height="40" rx="6" fill="none" stroke="currentColor" /><text x="340" y="64" text-anchor="middle">decoder</text>
        <line x1="390" y1="60" x2="438" y2="60" stroke="currentColor" marker-end="url(#ar)" />
        <rect x="440" y="40" width="120" height="40" rx="6" fill="none" stroke="var(--pred)" stroke-width="2" /><text x="500" y="64" text-anchor="middle">píxeles predichos</text>
        <rect x="640" y="40" width="110" height="40" rx="6" fill="none" stroke="var(--tgt)" stroke-width="2" /><text x="695" y="64" text-anchor="middle">píxeles reales y</text>
        <line x1="560" y1="60" x2="640" y2="60" stroke="var(--bad)" stroke-width="2" stroke-dasharray="4 3" />
        <text x="600" y="100" text-anchor="middle" fill="var(--bad)" font-weight="700">error en píxeles</text>
      </g>
      <line x1="0" y1="135" x2="760" y2="135" stroke="var(--line)" />
      <text x="0" y="168" font-size="13" font-weight="700" fill="currentColor">JEPA</text>
      <g font-size="12" fill="currentColor">
        <rect x="0" y="186" width="90" height="40" rx="6" fill="none" stroke="var(--ctx)" stroke-width="2" /><text x="45" y="210" text-anchor="middle">x visible</text>
        <line x1="90" y1="206" x2="138" y2="206" stroke="currentColor" marker-end="url(#ar)" />
        <rect x="140" y="186" width="100" height="40" rx="6" fill="none" stroke="var(--ctx)" /><text x="190" y="204" text-anchor="middle">encoder</text><text x="190" y="219" text-anchor="middle" font-size="10" fill="var(--muted)">de contexto</text>
        <line x1="240" y1="206" x2="288" y2="206" stroke="currentColor" marker-end="url(#ar)" />
        <rect x="290" y="186" width="100" height="40" rx="6" fill="none" stroke="var(--pred)" /><text x="340" y="210" text-anchor="middle">predictor</text>
        <line x1="390" y1="206" x2="438" y2="206" stroke="currentColor" marker-end="url(#ar)" />
        <rect x="440" y="186" width="120" height="40" rx="6" fill="none" stroke="var(--pred)" stroke-width="2" /><text x="500" y="204" text-anchor="middle">representación</text><text x="500" y="219" text-anchor="middle" font-size="10" fill="var(--muted)">predicha</text>
        <rect x="640" y="186" width="110" height="40" rx="6" fill="none" stroke="var(--tgt)" stroke-width="2" /><text x="695" y="204" text-anchor="middle">representación</text><text x="695" y="219" text-anchor="middle" font-size="10" fill="var(--muted)">real de y</text>
        <line x1="560" y1="206" x2="640" y2="206" stroke="var(--ok)" stroke-width="2" stroke-dasharray="4 3" />
        <text x="600" y="246" text-anchor="middle" fill="var(--ok)" font-weight="700">error en representaciones</text>
        <rect x="640" y="256" width="110" height="34" rx="6" fill="none" stroke="var(--tgt)" /><text x="695" y="270" text-anchor="middle">encoder objetivo</text><text x="695" y="284" text-anchor="middle" font-size="10" fill="var(--muted)">ve la parte oculta y</text>
        <line x1="695" y1="256" x2="695" y2="229" stroke="currentColor" marker-end="url(#ar)" />
      </g>
    </svg>
  </div>
  <figcaption>El decoder desaparece. A cambio aparece un segundo encoder que convierte la parte oculta en su representación, y el error se calcula ahí.</figcaption>
</figure>
