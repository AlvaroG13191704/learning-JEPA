<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import AjepaDemo from '../demos/AjepaDemo.svelte';
</script>

<Chapter id="p4" year="2023" meta={['Fei, Fan, Huang', 'fase 3']} title="A-JEPA: escuchar con los ojos de I-JEPA">
  {#snippet oneliner()}Un audio convertido en espectrograma es una imagen. <b>Pero sus ejes significan cosas distintas.</b>{/snippet}
  {#snippet story()}
    <p>Un espectrograma muestra el tiempo en horizontal y la frecuencia en vertical. Se puede tratar como imagen y aplicar I-JEPA casi sin cambios. La sorpresa de A-JEPA está en la máscara: en una foto, arriba y a la derecha son equivalentes; en audio, tapar un instante (todas las frecuencias de un momento) o una banda (una frecuencia durante todo el clip) obliga a la red a razonar de formas distintas.</p>
    <p>Por eso usan un <b>currículo</b>: en cada paso se sortea si la máscara será de bloques al azar (fácil, como en I-JEPA) o consciente del tiempo y la frecuencia (difícil), y la probabilidad de la difícil sube de 0 a 1 a lo largo del entrenamiento.</p>
  {/snippet}
  {#snippet demo()}<AjepaDemo />{/snippet}
  {#snippet keys()}
    <li><span>Mismo esqueleto que I-JEPA: encoder de contexto, encoder objetivo por EMA, predictor.</span></li>
    <li><span>La máscara se adapta a la modalidad: tiempo y frecuencia no son simétricos.</span></li>
    <li><span>Currículo: de fácil a difícil, para que el entrenamiento no se atasque al principio.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">p ∼ Bernoulli(f(s)),  f(s) = mín(1, √( s·(1 − c₀²)/S + c₀² )),  c₀ = 0.01</div>
    <p>s es el paso de entrenamiento y S el total. Si p = 1 se usa la máscara de tiempo-frecuencia; si p = 0, la de bloques. La pérdida es la misma de I-JEPA (distancia L2 promedio entre rasgos predichos y objetivo): cambia qué se oculta y cuándo.</p>
  {/snippet}
  {#snippet deep()}
    <p>Con un ViT-B pre-entrenado solo en AudioSet, reporta 48.6 mAP en AudioSet-2M, 38.4 en AudioSet-20K y 96.3 % en ESC-50, por encima de Audio-MAE. Para el ajuste fino proponen además un "enmascarado regularizado": en cada capa, un porcentaje de tokens deja de participar en el cálculo de los pesos de atención, en vez de borrar o poner a cero partes de la entrada (como hacen SpecAugment o Audio-MAE). En prueba la atención vuelve a ser normal. En tu fase 3 basta con lo esencial: el mismo código de I-JEPA sobre espectrogramas de Speech Commands, y comparar máscara aleatoria contra máscara de franjas.</p>
    <p class="src">Paper: <a href="https://arxiv.org/abs/2311.15830">A-JEPA (arXiv 2311.15830)</a></p>
  {/snippet}
  {#snippet bridge()}Imágenes, audio... el siguiente paso natural es el video, donde el tiempo añade una forma nueva de hacer trampa.{/snippet}
</Chapter>
