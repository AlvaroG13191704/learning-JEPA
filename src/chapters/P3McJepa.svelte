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
    <li><span>Flujo óptico auto-supervisado (la parte que llaman M-JEPA, basada en PWC-Net): el flujo predicho deforma los rasgos del fotograma t y se compara con los rasgos del fotograma t+1 en cada nivel de la pirámide; en el último nivel se deforma la imagen y se compara en píxeles.</span></li>
    <li><span>Contenido con VICReg sobre dos vistas aumentadas (recorte, color) de imágenes de ImageNet. El flujo se entrena con videos; el contenido, con imágenes.</span></li>
    <li><span>Las dos pérdidas comparten encoder (un ConvNeXt-T) y se suman en cada paso: el encoder resultante sirve tanto para segmentación (Cityscapes, DAVIS) como para estimar movimiento (KITTI, Sintel).</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">pérdida = Σ<sub>videos</sub> (L<sub>rec</sub> + L<sub>reg</sub> + L<sub>suave</sub> + L<sub>ciclo</sub> + L<sub>vc</sub>) + Σ<sub>imágenes</sub> L<sub>VICReg</sub></div>
    <p>Los cinco primeros términos son el flujo: reconstrucción de la imagen, regresión de rasgos por nivel, suavidad del flujo, consistencia de ciclo y regularización de varianza-covarianza. El último es el contenido. Cada término lleva su propio coeficiente, ajustado a mano. Dos objetivos, un encoder: la gracia está en compartir, no en una fórmula nueva.</p>
  {/snippet}
  {#snippet deep()}
    <p>El estimador de flujo es piramidal: predice el movimiento a varias escalas de la representación, de grueso a fino. Se añaden un término de suavidad y uno de consistencia de ciclo: los rasgos de t, llevados a t+1 con el flujo hacia adelante y devueltos con el flujo hacia atrás, deben volver a ser los mismos. Un detalle que el paper subraya: al entrenar las dos tareas juntas, el entrenamiento era muy inestable hasta que añadieron la regularización de varianza-covarianza en cada nivel de rasgos. Es el paper "más ingenieril" de la lista; su valor para ti es la idea de que el video da una señal de entrenamiento gratis (el movimiento) que las imágenes no tienen.</p>
    <p class="src">Paper: <a href="https://arxiv.org/abs/2307.12698">MC-JEPA (arXiv 2307.12698)</a></p>
  {/snippet}
  {#snippet bridge()}Si la receta funciona para píxeles, debería funcionar para cualquier cosa que se pueda cortar en parches. <b>Por ejemplo, el sonido.</b>{/snippet}
</Chapter>
