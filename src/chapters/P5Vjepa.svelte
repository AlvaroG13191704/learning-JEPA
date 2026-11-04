<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import VjepaDemo from '../demos/VjepaDemo.svelte';
</script>

<Chapter id="p5" year="2024" meta={['Bardes et al. (Meta)', 'fase 4']} title="V-JEPA: predecir en el tiempo">
  {#snippet oneliner()}La máscara se convierte en un <b>tubo</b> que atraviesa todos los fotogramas.{/snippet}
  {#snippet story()}
    <p>En un video, dos fotogramas seguidos son casi idénticos. Si tapas una región en un fotograma pero no en el siguiente, la red puede copiar la respuesta. Para cerrarle la puerta, V-JEPA tapa la <b>misma región espacial en todos los fotogramas</b>, como un tubo. Y tapa mucho: alrededor del 90 % del video.</p>
    <p>Lo entrenaron con unos 2 millones de videos públicos, sin texto, sin etiquetas y sin reconstruir un solo píxel. Para evaluarlo, congelan el encoder y entrenan solo una pequeña capa de atención encima. Que funcione así, congelado, es la prueba de que las representaciones ya traen el conocimiento.</p>
  {/snippet}
  {#snippet demo()}<VjepaDemo />{/snippet}
  {#snippet keys()}
    <li><span>Predicción de rasgos (features), no de píxeles, en video. El título del paper lo dice: "revisitar la predicción de rasgos".</span></li>
    <li><span>Máscaras espacio-temporales en tubo y con proporción muy alta.</span></li>
    <li><span>Evaluación con el encoder congelado: un solo modelo sirve para muchas tareas sin reentrenarlo.</span></li>
    <li><span>Bueno en tareas de movimiento (por ejemplo, Something-Something v2), donde los modelos de imagen fallan.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">pérdida = ‖ Pred(visible) − sg(Enc<sub>EMA</sub>(video))<sub>tubos</sub> ‖<sub>1</sub></div>
    <p>sg = stop-gradient. Usan error absoluto (L1) en vez de cuadrático.</p>
  {/snippet}
  {#snippet deep()}
    <p>El video se corta en "tubelets": bloques de 2 fotogramas × 16 × 16 píxeles. Combinan bloques de máscara cortos y largos para que el contexto sea pequeño y disperso. La sonda atentiva (una capa de atención con un token de consulta aprendible) es la forma estándar de evaluar estos encoders congelados; vale la pena implementarla en tu fase 4.</p>
    <p class="src">Paper: <a href="https://arxiv.org/abs/2404.08471">Revisiting Feature Prediction for Learning Visual Representations from Video (arXiv 2404.08471)</a></p>
  {/snippet}
  {#snippet bridge()}Un encoder que entiende video ya es una especie de modelo del mundo. Falta lo que LeCun pedía en 2022: <b>usarlo para actuar</b>.{/snippet}
</Chapter>
