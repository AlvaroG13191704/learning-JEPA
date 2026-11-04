<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import PlanningDemo from '../demos/PlanningDemo.svelte';
</script>

<Chapter id="p6" year="2025" meta={['Assran, Bardes et al. (Meta)', 'fase 5']} title="V-JEPA 2: de entender a planificar">
  {#snippet oneliner()}Primero mira un millón de horas de video. Después, con unas pocas horas de robot, <b>aprende qué pasa cuando actúa</b>.{/snippet}
  {#snippet story()}
    <p>V-JEPA 2 escala la receta: más de un millón de horas de video de internet y un encoder de alrededor de mil millones de parámetros. Eso le da entendimiento y capacidad de anticipar qué ocurrirá.</p>
    <p>La parte que cierra el círculo es <b>V-JEPA 2-AC</b> (action-conditioned). Congelan el encoder y entrenan un predictor nuevo que recibe la representación actual <i>y una acción</i> del brazo robótico, y predice la representación siguiente. Para esto bastan menos de 62 horas de video de robots, sin recompensas. Luego, para mover un objeto a una posición, le das una <b>imagen de la meta</b>, y el robot busca la secuencia de acciones cuyo futuro imaginado más se parece a esa meta. Lo probaron en brazos reales, en laboratorios donde nunca se entrenó.</p>
  {/snippet}
  {#snippet demo()}<PlanningDemo />{/snippet}
  {#snippet keys()}
    <li><span>Dos etapas: pre-entrenamiento sin acciones (video de internet) y post-entrenamiento con acciones (poco video de robot).</span></li>
    <li><span>Planificación como optimización: minimizar la energía entre el futuro imaginado y la meta. Es el "Modo 2" de LeCun hecho realidad.</span></li>
    <li><span>Zero-shot: tomar y colocar objetos en entornos nuevos sin recolectar datos ahí ni definir recompensas.</span></li>
    <li><span>El encoder también sirve, alineado con un modelo de lenguaje, para responder preguntas sobre video.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">a* = argmin<sub>a₁..a<sub>T</sub></sub> ‖ P(s, a₁..a<sub>T</sub>) − s<sub>meta</sub> ‖<sub>1</sub></div>
    <p>Busca las acciones cuyo estado final imaginado esté más cerca de la representación de la imagen meta. Se resuelve muestreando (método de entropía cruzada), no con gradientes.</p>
  {/snippet}
  {#snippet deep()}
    <p>El control es de horizonte receding (MPC): planificas varios pasos, ejecutas uno, vuelves a mirar y replanificas. Así se corrigen los errores del modelo. El predictor condicionado por acción es un transformer con atención causal por bloques sobre fotogramas, acciones y estado del efector.</p>
    <p>Limitaciones que reconocen: la meta tiene que darse como imagen, los horizontes son cortos, y la sensibilidad a la posición de la cámara. En tu fase 5 haces lo mismo en un gridworld o un juego 2D propio: entrenar el predictor (s, a) → s′ y planificar con CEM, como en esta demo.</p>
    <p class="src">Paper: <a href="https://arxiv.org/abs/2506.09985">V-JEPA 2 (arXiv 2506.09985)</a></p>
  {/snippet}
  {#snippet bridge()}Hasta aquí, todo es visión. Pero el mundo de la IA en 2025 lo dominan los modelos de lenguaje. <b>¿Les sirve JEPA?</b>{/snippet}
</Chapter>
