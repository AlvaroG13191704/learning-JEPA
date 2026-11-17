<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import EntropyDemo from '../demos/EntropyDemo.svelte';
</script>

<Chapter id="f4" year="Fundamento 4" meta={['teoría de la información', 'LLM-JEPA, contrastivo, rango efectivo']} title="Entropía, cross-entropy y KL">
  {#snippet oneliner()}Todo se reduce a medir la <b>sorpresa</b>. La cross-entropy es la sorpresa media de un modelo cuando le muestras la respuesta correcta.{/snippet}
  {#snippet story()}
    <p>Si un modelo le daba 90 % de probabilidad a la palabra que salió, se sorprende poco. Si le daba 1 %, se sorprende mucho. La teoría de la información mide esa sorpresa como −log p: vale 0 si p = 1, y crece sin límite cuando p se acerca a 0.</p>
    <p>La <b>entropía</b> H(p) es la sorpresa promedio cuando los resultados salen de la propia distribución p. Mide cuánta incertidumbre hay de verdad: una moneda justa tiene 1 bit, una moneda trucada que siempre sale cara tiene 0.</p>
    <p>La <b>cross-entropy</b> H(p, q) es la sorpresa promedio cuando los resultados salen de p (la realidad) pero tú esperabas q (tu modelo). Nunca es menor que H(p): creer algo equivocado solo puede sorprenderte más. La diferencia entre las dos es la <b>divergencia KL</b>, que mide cuánto se aleja q de p. Por eso, cuando entrenas un clasificador o un LLM minimizando la cross-entropy, estás empujando la distribución del modelo hacia la de los datos.</p>
  {/snippet}
  {#snippet demo()}<EntropyDemo />{/snippet}
  {#snippet after()}
    <p>¿Y por qué JEPA <i>no</i> usa cross-entropy? Porque para usarla, el modelo tiene que repartir probabilidad sobre todas las respuestas posibles: todas las palabras, o todos los valores de cada píxel. Eso es un modelo generativo. JEPA deja de predecir probabilidades sobre el mundo y predice un vector, así que su pérdida es una distancia (F1). LLM-JEPA es interesante justo por eso: mantiene la cross-entropy de siguiente palabra y le suma un término JEPA de distancia coseno.</p>
  {/snippet}
  {#snippet keys()}
    <li><span><b>Sorpresa</b> −log p. <b>Entropía</b> H(p): sorpresa media de la verdad. <b>Cross-entropy</b> H(p, q): sorpresa media del modelo. <b>KL</b> = H(p, q) − H(p) ≥ 0.</span></li>
    <li><span>Con una respuesta única (one-hot), la cross-entropy es simplemente −log q(respuesta correcta). Es la pérdida de clasificación y la de los LLMs.</span></li>
    <li><span>La <b>softmax</b> convierte números cualesquiera (logits) en probabilidades positivas que suman 1. Aparece en la salida de un LLM y dentro de la atención (F6).</span></li>
    <li><span>El <b>rango efectivo</b> de la demo de colapso es exp(entropía de los autovalores normalizados): mide cuántas dimensiones usa de verdad la red (F8).</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">H(p) = −Σ<sub>x</sub> p(x) log p(x)        H(p, q) = −Σ<sub>x</sub> p(x) log q(x)</div>
    <div class="eq">KL(p ‖ q) = Σ<sub>x</sub> p(x) log( p(x) / q(x) ) = H(p, q) − H(p)</div>
    <div class="eq">softmax(z)<sub>i</sub> = exp(z<sub>i</sub>) / Σ<sub>j</sub> exp(z<sub>j</sub>)</div>
    <p>La KL no es simétrica: KL(p ‖ q) ≠ KL(q ‖ p). No es una distancia en sentido estricto, aunque se use como tal.</p>
  {/snippet}
  {#snippet deep()}
    <p>Los métodos contrastivos (SimCLR, CLIP, F7) también usan cross-entropy, disfrazada. Su pérdida, InfoNCE, toma la similitud de un vector con su pareja y con todos los demás del lote, les aplica una softmax y pide que la probabilidad de la pareja correcta sea alta. Es un clasificador cuya "clase correcta" es "cuál de estos es mi pareja".</p>
    <p>En PyTorch, <code>F.cross_entropy(logits, target)</code> recibe los logits <i>antes</i> de la softmax (la aplica por dentro de forma numéricamente estable) y usa el logaritmo natural, así que el resultado está en nats. Una pérdida de 2.3 nats en 10 clases equivale a adivinar al azar: ln 10 ≈ 2.3.</p>
  {/snippet}
  {#snippet bridge()}Cuidado: en V-JEPA 2 aparece el "método de entropía cruzada". Suena igual, pero <b>no es una pérdida</b>: es una forma de buscar.{/snippet}
</Chapter>
