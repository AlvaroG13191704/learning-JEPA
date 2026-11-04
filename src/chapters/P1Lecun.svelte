<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import LecunDiagram from '../demos/LecunDiagram.svelte';
</script>

<Chapter id="p1" year="2022" meta={['Yann LeCun', 'documento de posición, 62 páginas']} title="El camino hacia máquinas autónomas">
  {#snippet oneliner()}Un plano de cómo debería pensar una IA: <b>un modelo del mundo</b> que imagina consecuencias en un espacio abstracto antes de actuar.{/snippet}
  {#snippet story()}
    <p>Un adolescente aprende a manejar con unas 20 horas de práctica. Un sistema de conducción autónoma necesita enormes cantidades de datos de expertos y millones de pruebas de aprendizaje por refuerzo. LeCun pregunta qué tienen los humanos que no tienen las máquinas, y su respuesta es un <b>modelo del mundo</b>: una intuición de cómo evolucionan las cosas, aprendida mirando, mucho antes de que nadie nos enseñe nada.</p>
    <p>El documento propone una arquitectura de seis módulos (configurador, percepción, modelo del mundo, costo, actor y memoria de corto plazo), todos diferenciables, y defiende que ese modelo del mundo no debe predecir píxeles, porque el futuro está lleno de detalles impredecibles. Debe predecir en un espacio de representaciones. Ahí nace la palabra JEPA, y también H-JEPA: varios JEPAs apilados, donde los niveles altos predicen más lejos en el tiempo y con menos detalle.</p>
  {/snippet}
  {#snippet demo()}<LecunDiagram />{/snippet}
  {#snippet keys()}
    <li><span>El objetivo no es un modelo que clasifique, sino uno que <b>prediga consecuencias</b> y pueda planificar.</span></li>
    <li><span>Modo 1 (reactivo, rápido, como un reflejo) frente a Modo 2 (planificar usando el modelo del mundo, lento y deliberado).</span></li>
    <li><span>Modelos basados en energía: en vez de dar probabilidades, la red da un número bajo cuando x e y son compatibles y alto cuando no.</span></li>
    <li><span>Posturas polémicas que el documento argumenta: arquitecturas de embedding conjunto (no generativas) en vez de generativas, energía sin necesidad de probabilidades, métodos regularizados en vez de contrastivos (porque los contrastivos sufren la maldición de la dimensionalidad) y modelos del mundo con control predictivo en vez de aprender a prueba y error con refuerzo. LeCun las resumió después en sus charlas como "cuatro recomendaciones"; en el texto no aparecen como una lista.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">E(x, y, z) = D( s<sub>y</sub>, Pred(s<sub>x</sub>, z) ),  F(x, y) = mín<sub>z</sub> E(x, y, z)</div>
    <p>La "energía" es la distancia entre lo que predijiste a partir de x y la representación real de y. La variable z (latente) captura lo que x no permite saber, por ejemplo si el auto que se acerca a una bifurcación toma el camino de la izquierda o el de la derecha. La energía final F se queda con el z que mejor explica lo que pasó.</p>
  {/snippet}
  {#snippet deep()}
    <p>El argumento contra predecir píxeles es que el futuro es multimodal: hay muchos futuros plausibles. Un modelo que minimiza el error en píxeles termina promediándolos y produce imágenes borrosas. En el espacio de representaciones, los detalles impredecibles se pueden descartar y el promedio deja de ser un problema.</p>
    <p>Para entrenar un JEPA sin colapso, el documento enumera cuatro criterios: (1) maximizar la información de s<sub>x</sub> sobre x, (2) maximizar la de s<sub>y</sub> sobre y, (3) que s<sub>y</sub> sea fácil de predecir desde s<sub>x</sub>, y (4) minimizar la información de la variable latente z, para que el predictor no "haga trampa" metiendo toda la respuesta en z. Para (1) y (2) propone métodos no contrastivos como VICReg y Barlow Twins.</p>
    <p>En H-JEPA, el JEPA-1 hace predicciones de corto plazo con representaciones de bajo nivel, y el JEPA-2 toma esas representaciones como entrada para predecir más lejos con descripciones más gruesas. Es la base que propone para planificar de forma jerárquica bajo incertidumbre.</p>
    <p class="src">Paper: <a href="https://openreview.net/forum?id=BZ5a1r-kVsf">A Path Towards Autonomous Machine Intelligence (OpenReview)</a></p>
  {/snippet}
  {#snippet bridge()}Era un plano sin edificio. Un año después, el equipo de Meta construyó la primera pieza: <b>un JEPA para imágenes</b>.{/snippet}
</Chapter>
