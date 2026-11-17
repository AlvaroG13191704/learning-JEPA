<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import DistanceDemo from '../demos/DistanceDemo.svelte';
</script>

<Chapter id="f1" year="Fundamento 1" meta={['álgebra lineal', 'aparece en todos los papers']} title="Vectores, normas y distancias">
  {#snippet oneliner()}Una representación es <b>una lista de números</b>. Aprender es acercar la lista predicha a la real, y "acercar" necesita una regla para medir.{/snippet}
  {#snippet story()}
    <p>Cuando I-JEPA "representa" un parche de la imagen, produce un vector: una lista de, por ejemplo, 384 números. Cada número es una coordenada en un espacio de 384 dimensiones, el <b>espacio latente</b>. No podemos dibujar 384 dimensiones, pero la intuición de 2 dimensiones funciona igual: cada parche es un punto, y parches con significado parecido deberían quedar cerca.</p>
    <p>La idea central de JEPA es comparar dos puntos: la representación que el <span class="k-pred">predictor</span> adivina, ŝ, y la que el <span class="k-tgt">encoder objetivo</span> calcula de verdad, s. Su resta, ŝ − s, es el <b>vector de error</b>. Para convertirlo en un solo número que podamos minimizar, usamos una <b>norma</b>: una manera de medir la longitud de un vector.</p>
    <p>Hay tres reglas que vas a ver una y otra vez. <b>L2</b> (euclídea): la longitud en línea recta, la de la regla del colegio. <b>L1</b> (Manhattan): sumar el tamaño del error en cada dimensión, como caminar por una ciudad en cuadrícula. <b>Coseno</b>: ignora las longitudes y mide solo si las dos flechas apuntan hacia el mismo lado.</p>
  {/snippet}
  {#snippet demo()}<DistanceDemo />{/snippet}
  {#snippet after()}
    <p>¿Por qué un paper elige una u otra? Piensa en cómo empuja cada una al aprender. Con L2 al cuadrado, el empuje es proporcional al error: un error de 4 empuja cuatro veces más que uno de 1, así que unos pocos parches muy mal predichos pueden dominar el entrenamiento. Con L1, el empuje tiene siempre el mismo tamaño, sea el error grande o pequeño: es más robusta a esos casos raros. V-JEPA dice que eligió L1 porque le dio entrenamientos más estables.</p>
  {/snippet}
  {#snippet keys()}
    <li><span><b>Vector</b> = flecha desde el origen o lista de coordenadas. Dimensión = cuántos números tiene.</span></li>
    <li><span><b>Producto punto</b> a·b = Σ aᵢbᵢ. Grande si apuntan al mismo lado, 0 si son perpendiculares. Es la operación básica de la atención (F6) y de la similitud coseno.</span></li>
    <li><span><b>Matriz</b> = una transformación de vectores (girar, estirar, proyectar). Cada capa lineal de una red es una matriz W: y = Wx + b.</span></li>
    <li><span><b>Covarianza y autovalores</b>: describen la forma de una nube de vectores. Los usamos en F8 para detectar el colapso.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">‖e‖₁ = |e₁| + |e₂| + … + |e<sub>d</sub>|        ‖e‖₂ = √(e₁² + e₂² + … + e<sub>d</sub>²)</div>
    <div class="eq">cos(a, b) = (a · b) / (‖a‖₂ ‖b‖₂)</div>
    <p>Con e = ŝ − s. I-JEPA minimiza ‖ŝ − s‖₂² (a veces se le llama MSE, error cuadrático medio, cuando se promedia). V-JEPA minimiza ‖ŝ − s‖₁. LLM-JEPA usa 1 − cos.</p>
  {/snippet}
  {#snippet deep()}
    <p>Un detalle que conecta todo: si normalizas los vectores para que tengan longitud 1 (‖a‖ = ‖b‖ = 1), entonces ‖a − b‖₂² = 2 − 2·cos(a, b). Minimizar L2 entre vectores normalizados es lo mismo que maximizar el coseno. BYOL lo usa exactamente así.</p>
    <p>En PyTorch: <code>(pred - target).abs().mean()</code> es L1 promediado; <code>F.mse_loss(pred, target)</code> es L2 al cuadrado promediado; <code>F.cosine_similarity(a, b, dim=-1)</code> es el coseno. Las tres trabajan sobre tensores de forma (lote, parches, dimensión).</p>
    <p class="src">Para la intuición geométrica de matrices y autovalores: <a href="https://www.3blue1brown.com/topics/linear-algebra">Essence of Linear Algebra (3Blue1Brown)</a>.</p>
  {/snippet}
  {#snippet bridge()}Ya sabemos medir el error. Ahora, <b>¿cómo cambia la red sus pesos para que el error baje?</b>{/snippet}
</Chapter>
