<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import AjepaDemo from '../demos/AjepaDemo.svelte';
</script>

<Chapter id="p4" year="2023" meta={['Fei, Fan, Huang', 'fase 3']} title="A-JEPA: escuchar con los ojos de I-JEPA">
  {#snippet oneliner()}Un audio convertido en espectrograma es una imagen. <b>Pero sus ejes significan cosas distintas.</b>{/snippet}
  {#snippet story()}
    <p>Un espectrograma muestra el tiempo en horizontal y la frecuencia en vertical. Se puede tratar como imagen y aplicar I-JEPA casi sin cambios. La sorpresa de A-JEPA está en la máscara: en una foto, arriba y a la derecha son equivalentes; en audio, tapar un instante (todas las frecuencias de un momento) o una banda (una frecuencia durante todo el clip) obliga a la red a razonar de formas distintas.</p>
    <p>Por eso usan un <b>currículo</b>: al principio máscaras aleatorias (fáciles), y poco a poco máscaras conscientes del tiempo y la frecuencia (más difíciles).</p>
  {/snippet}
  {#snippet demo()}<AjepaDemo />{/snippet}
  {#snippet keys()}
    <li><span>Mismo esqueleto que I-JEPA: encoder de contexto, encoder objetivo por EMA, predictor.</span></li>
    <li><span>La máscara se adapta a la modalidad: tiempo y frecuencia no son simétricos.</span></li>
    <li><span>Currículo: de fácil a difícil, para que el entrenamiento no se atasque al principio.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">P(máscara tiempo-frecuencia) crece con el progreso t ∈ [0, 1]</div>
    <p>No hay pérdida nueva. Cambia qué se oculta y cuándo.</p>
  {/snippet}
  {#snippet deep()}
    <p>Para el ajuste fino en tareas como clasificación de sonidos, proponen además una forma de enmascarar regularizada que reemplaza al dropout en la atención. En tu fase 3 basta con lo esencial: el mismo código de I-JEPA sobre espectrogramas de Speech Commands, y comparar máscara aleatoria contra máscara de franjas.</p>
    <p class="src">Paper: busca "A-JEPA: Joint-Embedding Predictive Architecture Can Listen" en <a href="https://arxiv.org/">arXiv</a></p>
  {/snippet}
  {#snippet bridge()}Imágenes, audio... el siguiente paso natural es el video, donde el tiempo añade una forma nueva de hacer trampa.{/snippet}
</Chapter>
