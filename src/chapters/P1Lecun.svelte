<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import LecunDiagram from '../demos/LecunDiagram.svelte';
</script>

<Chapter id="p1" year="2022" meta={['Yann LeCun', 'documento de posición, ~60 páginas']} title="El camino hacia máquinas autónomas">
  {#snippet oneliner()}Un plano de cómo debería pensar una IA: <b>un modelo del mundo</b> que imagina consecuencias en un espacio abstracto antes de actuar.{/snippet}
  {#snippet story()}
    <p>Un adolescente aprende a manejar en unas 20 horas. Un sistema de conducción autónoma necesita millones de ejemplos. LeCun pregunta qué tienen los humanos que no tienen las máquinas, y su respuesta es un <b>modelo del mundo</b>: una intuición de cómo evolucionan las cosas, aprendida mirando, mucho antes de que nadie nos enseñe nada.</p>
    <p>El documento propone una arquitectura de seis módulos y defiende que ese modelo del mundo no debe predecir píxeles, porque el futuro está lleno de detalles impredecibles. Debe predecir en un espacio de representaciones. Ahí nace la palabra JEPA, y también H-JEPA: varios JEPAs apilados, donde los niveles altos predicen más lejos en el tiempo y con menos detalle.</p>
  {/snippet}
  {#snippet demo()}<LecunDiagram />{/snippet}
  {#snippet keys()}
    <li><span>El objetivo no es un modelo que clasifique, sino uno que <b>prediga consecuencias</b> y pueda planificar.</span></li>
    <li><span>Modo 1 (reactivo, rápido, como un reflejo) frente a Modo 2 (planificar usando el modelo del mundo, lento y deliberado).</span></li>
    <li><span>Modelos basados en energía: en vez de dar probabilidades, la red da un número bajo cuando x e y son compatibles y alto cuando no.</span></li>
    <li><span>Cuatro recomendaciones polémicas: preferir arquitecturas de embedding conjunto a generativas, energía a probabilidades, regularización a contraste, y control predictivo a aprendizaje por refuerzo.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">E(x, y) = D( s<sub>y</sub>, Pred(s<sub>x</sub>, z) )</div>
    <p>La "energía" es la distancia entre lo que predijiste a partir de x y la representación real de y. La variable z (latente) captura lo que x no permite saber, por ejemplo si el auto de enfrente gira a la izquierda o a la derecha.</p>
  {/snippet}
  {#snippet deep()}
    <p>El argumento contra predecir píxeles es que el futuro es multimodal: hay muchos futuros plausibles. Un modelo que minimiza el error en píxeles termina promediándolos y produce imágenes borrosas. En el espacio de representaciones, los detalles impredecibles se pueden descartar y el promedio deja de ser un problema.</p>
    <p>Para evitar el colapso, el documento propone maximizar el contenido de información de las representaciones (de ahí VICReg, co-escrito por LeCun) y minimizar la información de la variable latente z, para que el predictor no "haga trampa" metiendo toda la respuesta en z.</p>
    <p class="src">Paper: <a href="https://openreview.net/forum?id=BZ5a1r-kVsf">A Path Towards Autonomous Machine Intelligence (OpenReview)</a></p>
  {/snippet}
  {#snippet bridge()}Era un plano sin edificio. Un año después, el equipo de Meta construyó la primera pieza: <b>un JEPA para imágenes</b>.{/snippet}
</Chapter>
