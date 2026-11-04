<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import IjepaDemo from '../demos/IjepaDemo.svelte';
</script>

<Chapter id="p2" year="2023" meta={['Assran et al. · CVPR 2023', 'fases 1–2 de tu proyecto']} title="I-JEPA: aprender de imágenes sin aumentos">
  {#snippet oneliner()}Un bloque grande de la imagen <b>predice la representación</b> de cuatro bloques ocultos. Nada más.{/snippet}
  {#snippet story()}
    <p>I-JEPA corta la imagen en parches (una cuadrícula de 14×14 para una imagen de 224 píxeles con parches de 16). Elige cuatro rectángulos como <span class="k-tgt">objetivos</span> y un rectángulo grande como <span class="k-ctx">contexto</span>, al que le quita cualquier parche que se solape con los objetivos. El encoder de contexto solo ve los parches azules. El encoder objetivo ve la imagen completa, y de su salida se recortan los parches ámbar. El predictor recibe el contexto más "marcadores" que dicen en qué posición está cada parche a adivinar.</p>
    <p>El tamaño de los bloques importa mucho. Si los objetivos son diminutos, se pueden adivinar mirando el parche de al lado y la red aprende textura. Si son grandes, la red tiene que entender <i>partes de objetos</i>: dónde va la cabeza del perro, qué hay debajo de la mesa.</p>
  {/snippet}
  {#snippet demo()}<IjepaDemo />{/snippet}
  {#snippet keys()}
    <li><span><b>Sin aumentos de datos.</b> Ni recortes ni cambios de color: solo enmascarar. Eso lo hace más general que BYOL o SimCLR.</span></li>
    <li><span>El encoder objetivo es una copia EMA del encoder de contexto (la receta de BYOL), y no recibe gradientes.</span></li>
    <li><span>Las representaciones se comparan parche a parche, con error cuadrático (L2).</span></li>
    <li><span>Eficiente: según el paper, un ViT-Huge se entrena en ImageNet en menos de 72 horas con 16 GPUs A100, mucho menos cómputo que otros métodos comparables.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">pérdida = (1/4) Σ<sub>i=1..4</sub> Σ<sub>parche j ∈ bloque i</sub> ‖ ŝ<sub>j</sub> − s<sub>j</sub> ‖²</div>
    <p>Para cada uno de los 4 bloques objetivo, sumamos la distancia entre la representación predicha y la real de cada parche.</p>
  {/snippet}
  {#snippet deep()}
    <p>El predictor es un transformer estrecho (menos dimensiones que el encoder). Recibe los tokens del contexto más un token de máscara compartido por cada posición objetivo, sumado a su embedding posicional. Se ejecuta una vez por bloque objetivo.</p>
    <p>Que el encoder objetivo vea la imagen completa es importante: así cada parche objetivo tiene contexto global, y su representación es más semántica que si viera solo el bloque. Es un detalle fácil de equivocar al implementar.</p>
    <p>Comparado con MAE (que reconstruye píxeles), I-JEPA gana en evaluación lineal (encoder congelado + un clasificador lineal), justo porque no gasta capacidad en detalles de píxel. En tu fase 1 reproduces esto en CIFAR-10 con un ViT-Tiny.</p>
    <p class="src">Paper: <a href="https://arxiv.org/abs/2301.08243">I-JEPA (arXiv 2301.08243)</a></p>
  {/snippet}
  {#snippet bridge()}Las imágenes son estáticas. Pero el mundo se mueve. <b>¿Puede un mismo encoder aprender qué hay y cómo se mueve?</b>{/snippet}
</Chapter>
