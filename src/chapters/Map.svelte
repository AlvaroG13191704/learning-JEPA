<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  const rows = [
    ['1', 'Mini I-JEPA en CIFAR-10', 'I-JEPA, BYOL', '¿Qué pasa si quito el EMA? (verás el colapso)'],
    ['2', 'Anti-colapso comparado', 'VICReg, LeJEPA', 'EMA, VICReg o SIGReg: ¿cuál da mejor rango efectivo?'],
    ['3', 'Audio', 'A-JEPA', '¿Importa enmascarar franjas de tiempo y frecuencia?'],
    ['4', 'Video', 'V-JEPA, MC-JEPA', '¿El encoder capta movimiento con máscaras en tubo?'],
    ['5', 'Modelo del mundo con acciones', 'V-JEPA 2-AC, LeCun 2022', '¿Puedo planificar solo con representaciones?'],
    ['6', 'JEPA en texto', 'LLM-JEPA, Platónica', '¿Las buenas vistas alinean texto con imágenes?'],
  ];
</script>

<Chapter id="mapa" year="Epílogo" meta={['cómo se conecta con jepa-lab']} title="Del paper al código">
  {#snippet oneliner()}Cada capítulo corresponde a una fase de tu plan. <b>Las fases 3 a 6 son independientes</b>: elige la que más te llame después de la 2.{/snippet}
  {#snippet story()}
    <div class="mt-5 max-w-[900px] overflow-x-auto">
      <table class="w-full border-collapse text-[.95rem]">
        <thead>
          <tr class="font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">
            {#each ['Fase', 'Qué construyes', 'Papers', 'La pregunta que respondes'] as h}<th class="border-b border-line px-2.5 py-2 text-left font-normal">{h}</th>{/each}
          </tr>
        </thead>
        <tbody>
          {#each rows as r}
            <tr>{#each r as c, i}<td class="border-b border-line px-2.5 py-2 align-top {i === 0 ? 'font-mono text-muted' : ''}">{c}</td>{/each}</tr>
          {/each}
        </tbody>
      </table>
    </div>
    <footer class="mt-16 border-t border-line pt-4 text-[.9rem] text-muted">
      Las cifras y detalles de BYOL, VICReg y los papers 2 a 9 están contrastados con los PDFs de arXiv. El documento de LeCun (paper 1) no se pudo descargar y su capítulo sigue sin contrastar. Antes de citar un número, compruébalo en el paper. Las demos son simplificaciones didácticas en 2D, no reproducciones de los experimentos.
    </footer>
  {/snippet}
</Chapter>
