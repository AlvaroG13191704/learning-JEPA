<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import McDemo from '../demos/McDemo.svelte';
</script>

<Chapter id="p3" year="2023" meta={['Bardes, Ponce, LeCun', 'fase 4']} title="MC-JEPA: movimiento y contenido a la vez">
  {#snippet oneliner()}Un solo encoder aprende <b>qué</b> es cada cosa y <b>hacia dónde</b> se mueve.{/snippet}
  {#snippet story()}
    <p>Los métodos auto-supervisados de imágenes aprenden contenido (esto es un auto) pero ignoran el movimiento. Los de flujo óptico estiman el movimiento píxel a píxel (esto se desplaza 3 píxeles a la derecha) pero no saben qué es. MC-JEPA entrena las dos tareas con el mismo encoder y muestra que se ayudan: saber qué es un objeto ayuda a seguirlo, y seguirlo ayuda a separarlo del fondo.</p>
  {/snippet}
  {#snippet demo()}<McDemo />{/snippet}
  {#snippet keys()}
    <li><span>Flujo óptico auto-supervisado: se predice el movimiento y se verifica deformando un fotograma para reconstruir el siguiente.</span></li>
    <li><span>Contenido con una pérdida tipo VICReg sobre imágenes.</span></li>
    <li><span>Las dos pérdidas comparten encoder y se entrenan juntas: el encoder resultante sirve tanto para segmentación como para estimar movimiento.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">pérdida = pérdida<sub>flujo</sub> + pérdida<sub>contenido (VICReg)</sub></div>
    <p>Dos objetivos, un encoder. La gracia está en compartir, no en una fórmula nueva.</p>
  {/snippet}
  {#snippet deep()}
    <p>El estimador de flujo es piramidal: predice el movimiento a varias escalas de la representación, de grueso a fino. Se añaden términos de suavidad y de consistencia entre flujo hacia adelante y hacia atrás. Es el paper "más ingenieril" de la lista; su valor para ti es la idea de que el video da una señal de entrenamiento gratis (el movimiento) que las imágenes no tienen.</p>
    <p class="src">Paper: busca "MC-JEPA: A Joint-Embedding Predictive Architecture for Self-Supervised Learning of Motion and Content Features" en <a href="https://arxiv.org/">arXiv</a></p>
  {/snippet}
  {#snippet bridge()}Si la receta funciona para píxeles, debería funcionar para cualquier cosa que se pueda cortar en parches. <b>Por ejemplo, el sonido.</b>{/snippet}
</Chapter>
