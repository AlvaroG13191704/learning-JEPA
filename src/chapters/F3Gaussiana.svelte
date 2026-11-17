<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import GaussDemo from '../demos/GaussDemo.svelte';
</script>

<Chapter id="f3" year="Fundamento 3" meta={['probabilidad', 'LeJEPA, CEM, inicialización']} title="Probabilidad y la campana de Gauss">
  {#snippet oneliner()}Una gaussiana es la forma en que se reparten las cosas que salen de <b>sumar muchas pequeñas causas al azar</b>. Dos números la describen: dónde está el centro y qué tan ancha es.{/snippet}
  {#snippet story()}
    <p>Una <b>distribución de probabilidad</b> dice qué valores puede tomar algo incierto y con qué frecuencia. La estatura de las personas, el error de medir con una regla, el ruido de un sensor: todos tienden a repartirse en forma de campana. No es casualidad. El teorema central del límite dice que cuando sumas muchas causas pequeñas e independientes, el resultado se parece a una gaussiana, sin importar cómo era cada causa.</p>
    <p>La gaussiana N(μ, σ²) tiene dos parámetros. La <b>media μ</b> es el centro, el valor más probable. La <b>desviación estándar σ</b> es el ancho: la distancia típica al centro. Su cuadrado, σ², es la <b>varianza</b>. Una regla útil: alrededor del 68 % de los valores cae a menos de 1σ del centro, y el 95 % a menos de 2σ.</p>
    <p>Y hay un truco que vas a usar todo el tiempo: para sacar un número de N(μ, σ²) no hace falta nada especial. Sacas ε de la campana estándar (media 0, desviación 1), que trae cualquier librería (<code>torch.randn</code>), y calculas x = μ + σ·ε. Mover μ desplaza la campana; multiplicar por σ la estira.</p>
  {/snippet}
  {#snippet demo()}<GaussDemo />{/snippet}
  {#snippet after()}
    <p>En varias dimensiones, la gaussiana tiene un vector de medias y una <b>matriz de covarianza</b> Σ, que dice qué tan ancha es la nube en cada dirección y si unas coordenadas se mueven junto con otras. Si Σ es la identidad (todas las direcciones con varianza 1 y sin correlaciones), la nube es una esfera perfecta: una <b>gaussiana isotrópica</b>, "igual en todas las direcciones". Esa es exactamente la forma que LeJEPA demuestra que deberían tener los embeddings.</p>
  {/snippet}
  {#snippet keys()}
    <li><span><b>Media</b> = centro. <b>Varianza</b> = promedio del cuadrado de la distancia al centro. <b>Desviación estándar</b> = raíz de la varianza, en las mismas unidades que los datos.</span></li>
    <li><span><b>Isotrópica</b> = misma varianza en todas las direcciones y sin correlaciones: Σ = I. Su contrario es una nube alargada, o aplastada en una línea (colapso dimensional, F8).</span></li>
    <li><span>Donde aparece en JEPA: LeJEPA empuja los embeddings hacia N(0, I) (SIGReg); CEM en V-JEPA 2-AC propone acciones sacándolas de una gaussiana (F5); los pesos de un ViT se inicializan al azar con una gaussiana estrecha.</span></li>
    <li><span>Entre todas las distribuciones con una varianza dada, la gaussiana es la de <b>máxima entropía</b> (F4): la que menos supuestos añade. Por eso es la elección "por defecto" cuando solo conoces media y varianza.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">p(x) = 1/(σ√(2π)) · exp( −(x − μ)² / (2σ²) )</div>
    <div class="eq">x = μ + σ·ε,   ε ~ N(0, 1)</div>
    <p>No hace falta memorizar la primera fórmula: basta ver que la probabilidad cae con el cuadrado de la distancia al centro, medida en unidades de σ. La segunda es la que de verdad escribes en código.</p>
  {/snippet}
  {#snippet deep()}
    <p>¿Cómo sabe SIGReg si una nube de 384 dimensiones es gaussiana? Usa un hecho bonito: si una nube es gaussiana isotrópica, su "sombra" sobre <i>cualquier</i> dirección también es una campana N(0, 1). Así que proyecta los embeddings sobre direcciones al azar (un producto punto, F1) y comprueba cada sombra 1D con un test estadístico. Es la demo del capítulo de LeJEPA.</p>
    <p>Muestra frente a población: lo que calculas con un lote (media y desviación de 256 embeddings) es una estimación de la verdadera, y tiene ruido. Lo ves en la demo: con 40 muestras, la media se aleja de μ; con miles, casi coincide. Por eso los regularizadores que miran estadísticas del lote, como VICReg, funcionan peor con lotes muy chicos.</p>
  {/snippet}
  {#snippet bridge()}Si un modelo reparte probabilidad entre varias respuestas, <b>¿cómo medimos qué tan bien lo hace?</b> Ahí entra la entropía.{/snippet}
</Chapter>
