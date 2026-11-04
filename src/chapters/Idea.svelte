<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import CompareDiagram from '../demos/CompareDiagram.svelte';
</script>

<Chapter id="idea" year="Prólogo" meta={['las tres piezas de todo JEPA']} title="La idea en un minuto">
  {#snippet oneliner()}Dos encoders y un predictor. La pérdida se mide <b>en el espacio de representaciones</b>, nunca en píxeles.{/snippet}
  {#snippet story()}
    <p>Imagina que ves la mitad izquierda de una foto: un perro corriendo en un parque. Si te piden dibujar la mitad derecha, fallarías en mil detalles imposibles de adivinar: la forma exacta de cada nube, cada hoja. Pero si te preguntan <i>qué</i> hay a la derecha, dirías sin dudar "más pasto, quizá la cola del perro". Esa segunda respuesta es la que JEPA (Joint-Embedding Predictive Architecture) intenta aprender.</p>
    <p>Tiene tres piezas. El <span class="k-ctx">encoder de contexto</span> resume lo que se ve. El <span class="k-tgt">encoder objetivo</span> resume lo que está oculto. El <span class="k-pred">predictor</span> toma el resumen del contexto y adivina el resumen del objetivo. Comparamos las dos representaciones y ajustamos la red para que la predicción se acerque.</p>
  {/snippet}
  {#snippet demo()}<CompareDiagram />{/snippet}
  {#snippet after()}
    <p>Hay una trampa evidente. Si la red aprende a dar <b>el mismo vector para todo</b>, la predicción siempre es perfecta y la pérdida es cero, pero no aprendió nada. Eso se llama <b>colapso</b>. Casi cada paper de esta guía es, en el fondo, una respuesta distinta a la pregunta "¿cómo evitamos el colapso?". Por eso empezamos por ahí.</p>
  {/snippet}
</Chapter>
