<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import LlmJepaDemo from '../demos/LlmJepaDemo.svelte';
</script>

<Chapter id="p7" year="2025" meta={['Huang, LeCun, Balestriero', 'fase 6']} title="LLM-JEPA: un LLM que también piensa en vectores">
  {#snippet oneliner()}Se mantiene la predicción del siguiente token y se <b>añade</b> una pérdida JEPA entre dos vistas del mismo significado.{/snippet}
  {#snippet story()}
    <p>Muchas tareas tienen dos "vistas" naturales del mismo contenido: una descripción en español y el código que la implementa, una pregunta y su consulta SQL. Un LLM normal solo aprende a generar el siguiente token. LLM-JEPA le pide además que el embedding de la descripción, pasado por un predictor, caiga cerca del embedding del código.</p>
    <p>El predictor es barato: no es una red aparte, sino unos tokens especiales que se añaden al final del texto, de modo que el propio LLM hace de predictor. Según el paper, mejora el ajuste fino en tareas de texto a regex, matemáticas (GSM8K) y texto a SQL, en varias familias de modelos, y resiste mejor el sobreajuste.</p>
  {/snippet}
  {#snippet demo()}<LlmJepaDemo />{/snippet}
  {#snippet keys()}
    <li><span>No reemplaza la pérdida de LLM: la complementa. El modelo sigue generando texto igual que antes.</span></li>
    <li><span>Necesita datos con dos vistas. Esa es su mayor limitación práctica.</span></li>
    <li><span>Coste extra en entrenamiento (hay que pasar ambas vistas), ninguno en inferencia.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">pérdida = pérdida<sub>siguiente token</sub> + λ · (1 − cos( Pred(Enc(texto)), Enc(código) ))</div>
    <p>La similitud coseno mide si dos vectores apuntan en la misma dirección. λ controla cuánto pesa la parte JEPA.</p>
  {/snippet}
  {#snippet deep()}
    <p>El embedding de cada vista se toma del estado oculto del último token en la última capa. Cada vista se pasa por separado pero con el mismo modelo. Un efecto curioso que reportan: las representaciones de texto y código quedan relacionadas casi linealmente, lo que encaja con el último paper de esta guía.</p>
    <p class="src">Paper: busca "LLM-JEPA: Large Language Models Meet Joint Embedding Predictive Architectures" en <a href="https://arxiv.org/">arXiv</a></p>
  {/snippet}
  {#snippet bridge()}Todos estos JEPAs dependen de trucos: EMA, stop-gradient, programaciones de hiperparámetros. <b>¿Y si no hicieran falta?</b>{/snippet}
</Chapter>
