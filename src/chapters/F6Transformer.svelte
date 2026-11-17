<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import AttentionDemo from '../demos/AttentionDemo.svelte';
</script>

<Chapter id="f6" year="Fundamento 6" meta={['arquitectura', 'todos los encoders y predictores']} title="Atención, Transformers y ViT">
  {#snippet oneliner()}Un Transformer deja que cada pieza de la entrada <b>pregunte a todas las demás</b> qué tienen que ver con ella, y mezcle sus respuestas.{/snippet}
  {#snippet story()}
    <p>Un Vision Transformer (ViT) corta la imagen en parches cuadrados, típicamente de 16×16 píxeles. Cada parche se aplana y una capa lineal lo convierte en un vector: un <b>token</b>. Como al cortar se pierde dónde estaba cada parche, se le suma un <b>embedding posicional</b>, otro vector que codifica su posición. Una imagen de 224×224 se convierte así en una secuencia de 14×14 = 196 tokens.</p>
    <p>La pieza clave es la <b>atención</b>. Cada token produce tres vectores: una <b>consulta</b> (query, "qué busco"), una <b>clave</b> (key, "qué ofrezco") y un <b>valor</b> (value, "qué información paso"). La consulta de un token se compara con las claves de todos usando el producto punto (F1). Esos puntajes pasan por una softmax (F4) y se convierten en pesos que suman 1. La salida es el promedio de los valores, ponderado por esos pesos. Un parche de techo puede así "mirar" a los otros parches de la casa y entender que es parte de una casa.</p>
    <p>Un bloque Transformer es atención seguida de una pequeña red por token (MLP), con conexiones residuales y normalización. Un ViT apila 12, 24 o más bloques. El tamaño del vector define el modelo: 192 en ViT-Tiny, 384 en ViT-Small, 768 en ViT-Base, 1024 en ViT-Large y 1280 en ViT-Huge.</p>
  {/snippet}
  {#snippet demo()}<AttentionDemo />{/snippet}
  {#snippet after()}
    <p>Esto encaja con JEPA de forma muy natural. Como el Transformer trabaja sobre una lista de tokens, al <span class="k-ctx">encoder de contexto</span> de I-JEPA simplemente le pasas <i>solo</i> los parches visibles: los tapados no se ocultan con negro, directamente no están. El <span class="k-pred">predictor</span> es otro Transformer, más estrecho, que recibe esos tokens más un token de máscara por cada parche a adivinar, sumado a su embedding posicional: "dime qué hay en la posición (3, 7)".</p>
  {/snippet}
  {#snippet keys()}
    <li><span><b>Token</b> = un vector por parche (o por palabra, o por trozo de audio). <b>Embedding posicional</b> = dónde estaba.</span></li>
    <li><span><b>Atención</b> = softmax de productos punto consulta·clave, usada para promediar valores. Multi-cabeza: varias atenciones en paralelo, cada una buscando relaciones distintas.</span></li>
    <li><span>La atención mira a todos con todos, así que su coste crece con el cuadrado del número de tokens. Por eso V-JEPA agrupa el video en "tubelets" (2 fotogramas × 16 × 16 píxeles).</span></li>
    <li><span>Atención <b>causal</b> = un token solo puede mirar a los anteriores. La usan los LLMs y el predictor de V-JEPA 2-AC, que no puede mirar el futuro.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">Atención(Q, K, V) = softmax( Q·Kᵀ / √d ) · V</div>
    <p>Q, K y V son matrices con una fila por token, obtenidas multiplicando los tokens por tres matrices de pesos aprendidas. Dividir por √d (d = dimensión de las claves) evita que los productos punto crezcan tanto que la softmax se vuelva un "todo o nada"; hace el papel de la temperatura de la demo.</p>
  {/snippet}
  {#snippet deep()}
    <p>Al final del ViT tienes un vector por parche. Para clasificar la imagen entera hace falta un solo vector: se promedian todos (average pooling) o se usa una sonda de atención, una capa de atención con un único token de consulta aprendible que decide qué parches importan. Así evalúan V-JEPA y V-JEPA 2 sus encoders congelados.</p>
    <p>En tu fase 1, un ViT-Tiny sobre CIFAR-10 (imágenes de 32×32) con parches de 4×4 da 8×8 = 64 tokens de 192 dimensiones: la misma cuadrícula de 8×8 de esta demo.</p>
    <p class="src">Lectura recomendada: <a href="https://jalammar.github.io/illustrated-transformer/">The Illustrated Transformer (Jay Alammar)</a> · <a href="https://arxiv.org/abs/2010.11929">ViT (arXiv 2010.11929)</a></p>
  {/snippet}
  {#snippet bridge()}Con un encoder y una distancia ya puedes entrenar. La pregunta es <b>qué comparar con qué</b>: ahí se separan las familias.{/snippet}
</Chapter>
