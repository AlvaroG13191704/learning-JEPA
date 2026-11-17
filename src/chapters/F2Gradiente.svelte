<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import GradientDemo from '../demos/GradientDemo.svelte';
</script>

<Chapter id="f2" year="Fundamento 2" meta={['cálculo y optimización', 'cómo aprende cualquier red']} title="Optimización por gradiente">
  {#snippet oneliner()}Estás en una montaña con niebla y quieres bajar. Solo sientes la pendiente bajo tus pies: <b>da un paso cuesta abajo y repite</b>.{/snippet}
  {#snippet story()}
    <p>Una red tiene millones de pesos (números ajustables). Para cada combinación de pesos, la pérdida es un número: qué tan mal predice. Imagina ese número como la altura de un terreno con millones de direcciones. Entrenar es buscar un valle.</p>
    <p>El <b>gradiente</b> ∇L es una flecha que apunta hacia donde la pérdida <i>sube</i> más rápido. Su opuesto, −∇L, apunta cuesta abajo. El descenso por gradiente da un paso pequeño en esa dirección, recalcula la pendiente y vuelve a dar un paso. El tamaño del paso es la <b>tasa de aprendizaje</b> η, el hiperparámetro más importante de cualquier entrenamiento.</p>
    <p>Calcular el gradiente para millones de pesos parece imposible, pero la regla de la cadena lo resuelve de atrás hacia adelante en una sola pasada: eso es <b>backpropagation</b>, y PyTorch lo hace solo cuando llamas <code>loss.backward()</code>.</p>
  {/snippet}
  {#snippet demo()}<GradientDemo />{/snippet}
  {#snippet after()}
    <p>Con esto se entiende el truco más repetido de la guía, el <b>stop-gradient</b>. Significa "trata este valor como una constante: no calcules cómo cambiaría si moviera sus pesos". En I-JEPA y V-JEPA, la salida del <span class="k-tgt">encoder objetivo</span> lleva stop-gradient: el error empuja al <span class="k-ctx">encoder de contexto</span> y al <span class="k-pred">predictor</span> hacia el blanco, pero no puede mover el blanco hacia la predicción. Si pudiera, el camino más fácil sería que ambos se encontraran en un punto fijo: el colapso.</p>
  {/snippet}
  {#snippet keys()}
    <li><span><b>η demasiado grande</b>: zigzag y divergencia. <b>Demasiado pequeña</b>: avanza tan lento que no termina. Por eso se usan "calentamientos" (warmup) y programaciones que la bajan con el tiempo.</span></li>
    <li><span><b>SGD con mini-lotes</b>: el gradiente se estima con unas pocas imágenes, no con todo el dataset. Sale ruidoso (activa el ruido en la demo), pero es mucho más barato y el ruido incluso ayuda a escapar de malos valles.</span></li>
    <li><span><b>Adam / AdamW</b>: ajusta un tamaño de paso distinto para cada peso según su historia. Es el optimizador de casi todos los papers de esta guía; AdamW le añade el decaimiento de pesos (weight decay).</span></li>
    <li><span><b>Stop-gradient</b> en PyTorch es <code>.detach()</code> o calcular dentro de <code>torch.no_grad()</code>.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">w ← w − η · ∇<sub>w</sub>L(w)</div>
    <p>El gradiente ∇L es el vector de derivadas parciales: cuánto cambia la pérdida si mueves un poquito cada peso. Para la pérdida de la demo, que es un valle con forma de cuenco, hay un límite exacto: si η supera 2 dividido por la curvatura más fuerte, el descenso diverge.</p>
  {/snippet}
  {#snippet deep()}
    <p>Un paso de entrenamiento de tu mini I-JEPA, en cinco líneas: calcular las representaciones (forward), calcular la pérdida, <code>loss.backward()</code> (backprop, llena el gradiente de cada peso), <code>optimizer.step()</code> (aplica la regla de arriba con Adam), <code>optimizer.zero_grad()</code>. Después, fuera del gradiente, actualizas el encoder objetivo con EMA (F8). Ese último paso no es descenso por gradiente: es copiar un promedio.</p>
    <p class="src">Para construir backprop desde cero y entenderlo de verdad: <a href="https://karpathy.ai/zero-to-hero.html">Neural Networks: Zero to Hero (Karpathy)</a>, empezando por micrograd.</p>
  {/snippet}
  {#snippet bridge()}El gradiente busca de forma determinista. Pero muchos métodos de la guía <b>sacan números al azar</b>, casi siempre de una misma campana.{/snippet}
</Chapter>
