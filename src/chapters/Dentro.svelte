<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import PipelineDemo from '../demos/PipelineDemo.svelte';
</script>

<Chapter id="dentro" year="Prólogo" meta={['animación paso a paso', 'el código de la fase 1']} title="Por dentro de un JEPA">
  {#snippet oneliner()}Ocho líneas de código y <b>tres redes</b>. Mira cómo viaja cada vector en una sola iteración de entrenamiento.{/snippet}
  {#snippet story()}
    <p>El diagrama anterior dice qué piezas hay. Esta animación muestra <b>en qué orden trabajan</b> y qué recibe cada una. Usa la receta de I-JEPA, que es la base de casi todos los JEPAs posteriores: una imagen, un bloque oculto, dos encoders y un predictor.</p>
    <p>Fíjate en tres cosas mientras corre. Primero, el <span class="k-ctx">encoder de contexto</span> nunca ve los parches objetivo. Segundo, el <span class="k-tgt">encoder objetivo</span> sí ve todo, pero no recibe gradiente: es una copia lenta del de contexto. Tercero, el <span class="k-pred">predictor</span> sabe <i>dónde</i> tiene que predecir (los tokens de máscara llevan la posición) pero no <i>qué</i> hay.</p>
  {/snippet}
  {#snippet demo()}<PipelineDemo />{/snippet}
  {#snippet after()}
    <p>Pulsa <b>Romperlo</b> y deja correr varias iteraciones. Sin stop-grad ni EMA, el gradiente puede bajar la pérdida por el camino fácil: hacer que ambos encoders den el mismo vector para cualquier parche. La pérdida llega a casi cero y la red no aprendió nada. El capítulo de <a href="#f8">colapso</a> lo explica con números, y el de <a href="#p8">LeJEPA</a> muestra una forma de evitarlo sin EMA.</p>
  {/snippet}
  {#snippet keys()}
    <li><span>El objetivo de la predicción es una <b>representación</b> producida por otra red, no un píxel. Por eso puede ignorar detalles impredecibles.</span></li>
    <li><span>La asimetría (stop-grad + EMA + predictor) es lo que evita que el atajo trivial sea la mejor solución en la práctica.</span></li>
    <li><span>Cambiar de modalidad cambia sobre todo el <b>enmascarado</b>: bloques en imágenes, tubos espacio-temporales en video (V-JEPA), franjas de tiempo y frecuencia en audio (A-JEPA). Las ocho líneas siguen siendo las mismas.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">min<sub>θ,φ</sub> 1/|M| Σ<sub>i∈M</sub> ‖ g<sub>φ</sub>(f<sub>θ</sub>(x<sub>ctx</sub>), pos<sub>i</sub>) − sg[f<sub>θ̄</sub>(x)]<sub>i</sub> ‖²</div>
    <p>M son los parches objetivo, sg[·] es stop-gradient y θ̄ ← τθ̄ + (1 − τ)θ después de cada paso. I-JEPA usa la distancia L2 al cuadrado promediada; V-JEPA usa L1. La animación usa L2.</p>
  {/snippet}
  {#snippet deep()}
    <p>En código real, el paso 3 son dos detalles que suelen olvidarse: el encoder objetivo se evalúa con <code>torch.no_grad()</code> y sus pesos no están en el optimizador. La EMA se aplica a mano tras <code>opt.step()</code>, con un bucle sobre los parámetros. El predictor de I-JEPA es un ViT estrecho (menos ancho que el encoder) y procesa cada bloque objetivo por separado, aunque la animación junta los cuatro parches de un solo bloque.</p>
    <p class="src">Código de referencia: <a href="https://github.com/facebookresearch/ijepa">facebookresearch/ijepa</a> · ejemplos didácticos de imagen, video y planificación: <a href="https://github.com/facebookresearch/eb_jepa">facebookresearch/eb_jepa</a></p>
  {/snippet}
</Chapter>
