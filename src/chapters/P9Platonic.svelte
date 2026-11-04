<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import PlatonicDemo from '../demos/PlatonicDemo.svelte';
</script>

<Chapter id="p9" year="29 oct 2026" meta={['Balestriero, LeCun', 'fase 6']} title="Todos los modelos ven el mismo mundo">
  {#snippet oneliner()}Con <b>buenas vistas</b>, JEPAs distintos llegan a la misma representación, salvo una rotación.{/snippet}
  {#snippet story()}
    <p>La "hipótesis de la representación platónica" observa que modelos muy distintos (de visión, de lenguaje) parecen converger hacia representaciones parecidas a medida que crecen, como si todos miraran sombras del mismo mundo real. Este paper, el más reciente de la lista, la convierte en teorema para JEPAs bajo supuestos idealizados.</p>
    <p>La clave es qué cuenta como vistas. <b>Buenas vistas</b> son dos observaciones distintas de la misma escena, como dos captions escritos por personas distintas para la misma foto. <b>Malas vistas</b> son corrupciones de una sola observación, como un caption con palabras tapadas. Según el paper, predecir el siguiente token es un JEPA con malas vistas, y por eso los LLMs solo se alinean con los modelos de visión a fuerza de escala.</p>
  {/snippet}
  {#snippet demo()}<PlatonicDemo />{/snippet}
  {#snippet keys()}
    <li><span>Teorema: si las vistas positivas de cada modalidad relacionan los mismos estados del mundo, cada JEPA aprende la misma representación salvo una rotación. Supuestos: un mundo finito, renderizado de forma inyectiva, óptimos de población, predictor identidad y anti-colapso que blanquea (como VICReg o Barlow Twins en el límite) con una brecha espectral. Si las vistas difieren, la desalineación queda acotada.</span></li>
    <li><span>Reinterpretación: la predicción del siguiente token es un JEPA con malas vistas (un prefijo y su continuación dentro del mismo documento), cuyo término anti-colapso es la log-partición del softmax.</span></li>
    <li><span>Resultados: con buenas vistas hacen falta 42 veces menos muestras que con predicción del siguiente token sobre el mismo corpus para llegar a la misma alineación (21.6 M contra 900 M). Y un JEPA de texto de 109 millones de parámetros, entrenado con los textos de 940 M imágenes web, se alinea con los encoders de imagen de DINOv2 y CLIP mejor que todos los LLMs evaluados (hasta Qwen2.5-72B) y que el encoder de texto de CLIP.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">f<sub>m</sub>( g<sub>m</sub>(z) ) = Q<sub>m</sub> · h*(z),  Q<sub>m</sub> rotación</div>
    <p>z es un estado del mundo, g<sub>m</sub> lo "renderiza" en la modalidad m (los píxeles de una foto, los tokens de un caption) y f<sub>m</sub> es el encoder de esa modalidad. Todos los encoders llegan a la misma representación h* salvo una rotación cada uno, así que dos modalidades difieren en una sola rotación Q<sub>m</sub>Q<sub>m′</sub>ᵀ. Una rotación conserva distancias y ángulos: las dos nubes son la misma forma vista desde otro ángulo.</p>
  {/snippet}
  {#snippet deep()}
    <p>La alineación se mide como en el paper original de la hipótesis platónica: vecinos mutuos (mutual 10-NN) en WIT-1024. Encuentran además una ley de escala de la alineación, en función de la fracción de buenas vistas y las muestras vistas, que predice 85 corridas nuevas tan bien como repetirlas con otra semilla. Como aplicación, una sola rotación une encoders entrenados por separado para hacer un generador de captions (CIDEr .838 en COCO). Una advertencia que hace el propio paper: el teorema usa predictor identidad, así que no cubre los JEPAs con predictor aprendido o condicionado por acciones, como V-JEPA 2-AC.</p>
    <p>En tu fase 6 lo pruebas: un JEPA de texto pequeño con buenas vistas (dos captions de una imagen de COCO) contra malas vistas (dos versiones enmascaradas de un caption), y mides cuánto se alinea cada uno con un encoder de imágenes congelado.</p>
    <p class="src">Paper: <a href="https://arxiv.org/abs/2610.39302">Proving and Improving the Platonic Representation Hypothesis with JEPAs (arXiv 2610.39302)</a></p>
  {/snippet}
</Chapter>
