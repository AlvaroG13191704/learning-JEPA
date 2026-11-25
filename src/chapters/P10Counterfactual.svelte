<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import CounterfactualDemo from '../demos/CounterfactualDemo.svelte';
</script>

<Chapter id="p10" year="18 nov 2026" meta={['Balestriero, LeCun, Varaku', 'fase 5']} title="Mundos contrafácticos: ¿y si hubiera actuado distinto?">
  {#snippet oneliner()}Un modelo del mundo puede responder "¿qué habría pasado?" <b>sin datos contrafácticos ni reentrenar</b>: basta reutilizar el residuo que ya observó.{/snippet}
  {#snippet story()}
    <p>Un bote cruza un río. Pones rumbo recto hacia la otra orilla y llegas un poco más abajo, porque una corriente que no ves te arrastró. Ahora te preguntas: si hubiera girado 30 grados a la izquierda, <b>con esa misma corriente</b>, ¿dónde habría llegado? Esa es la pregunta contrafáctica individual. No es "qué pasa en promedio con esa acción", sino "qué habría pasado esta vez".</p>
    <p>El paper, el más reciente de esta guía, empieza con una mala noticia: un modelo del mundo entrenado solo con transiciones que sí ocurrieron <b>no puede</b> responder esa pregunta por sí solo, por muchos datos o parámetros que tenga. Los datos fijan qué resultados son posibles con cada acción, pero no cómo se emparejan entre acciones para la misma perturbación oculta.</p>
    <p>Y luego una buena: en sistemas físicos donde la acción y la perturbación actúan como fuerzas separadas, y para transiciones cortas, la respuesta es casi gratis. Toma lo que observaste y súmale la diferencia entre lo que el modelo predice con la acción alternativa y con la real. La perturbación queda dentro del resultado observado y viaja con él. Los autores lo resumen con un lema latino: <i>natura non facit saltus</i>, la naturaleza no da saltos.</p>
  {/snippet}
  {#snippet demo()}<CounterfactualDemo />{/snippet}
  {#snippet keys()}
    <li><span>Imposibilidad: con datos solo factuales, los contrafácticos individuales no están identificados, incluso con un modelo generativo perfecto. El ruido latente se puede reetiquetar por acción sin cambiar ninguna predicción factual.</span></li>
    <li><span>La regla (reutilizar el residuo) usa el predictor factual dos veces y una resta. Es exacta si acción y perturbación se suman, y para transiciones de duración h el error está acotado por O(h²) respecto a la varianza de la perturbación. Prueban también una cota inferior minimax que coincide.</span></li>
    <li><span>Desde píxeles, con JEPAs sobre encoders congelados (DINOv2 y MAE) en cuatro entornos, el R² contrafáctico sobre cantidades físicas sube de 38–46 % a 86–96 % con los mismos modelos. Aplicada directamente a las features de imagen, sin etiquetas de estado: 73–94 %. Con otros cuatro encoders (DINOv3, SigLIP 2, CLIP, EVA-02): 81–95 %.</span></li>
    <li><span>Planificación en retrospectiva: preguntar "¿qué acción habría llegado a la meta?" acierta en el 35–69 % de los casos, frente al 14–23 % de un planificador que conoce el simulador pero no el resultado observado.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">ẑ<sub>t+1</sub>(a′) = z<sub>t+1</sub> + μ(z<sub>t</sub>, a′) − μ(z<sub>t</sub>, a<sub>t</sub>)</div>
    <p>z<sub>t+1</sub> es lo observado tras la acción real a<sub>t</sub>, y μ es el predictor factual de un JEPA condicionado por acciones (como el de V-JEPA 2-AC). El error depende de la derivada mixta acción–perturbación: si la corriente no cambia según por dónde te lleve la acción, es cero.</p>
  {/snippet}
  {#snippet deep()}
    <p>La regla necesita tres supuestos: que la acción no dependa de la perturbación una vez conocido el estado (intercambiabilidad condicional), que la acción alternativa esté dentro de lo visto en el entrenamiento (overlap) y que la representación contenga suficiente estado. Una sola imagen, por ejemplo, puede no mostrar la velocidad. Los casos de fallo que el propio paper identifica y reproduce: discontinuidades (contactos), pliegues en las coordenadas de la representación, y perturbaciones que escalan la orden, como el motor averiado de la demo. También la prueban en un vehículo submarino BlueROV2 (90–94 %, con dieciséis veces más datos factuales).</p>
    <p>Para tu fase 5 es una extensión natural: con un encoder congelado y un predictor (z, a) → z′ pequeño, implementar la regla son tres líneas. La pregunta interesante es <b>dónde falla</b> en tu propio entorno: mide el error contrafáctico mientras alargas h o añades contactos.</p>
    <p class="src">Paper: <a href="https://arxiv.org/abs/2611.24778">Counterfactual World Models: JEPAs That Reason About "What If" (arXiv 2611.24778)</a> · código: <a href="https://github.com/galilai-group/counterfactual-WM">galilai-group/counterfactual-WM</a></p>
  {/snippet}
</Chapter>
