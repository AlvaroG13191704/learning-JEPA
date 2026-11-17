<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import RankDemo from '../demos/RankDemo.svelte';
</script>

<Chapter id="f8" year="Fundamento 8" meta={['álgebra lineal + estadística', 'BYOL, VICReg, I-JEPA, LeJEPA']} title="Colapso: cómo se mide y cómo se evita">
  {#snippet oneliner()}Colapsar es usar menos espacio del que tienes. Se ve en los <b>autovalores de la covarianza</b> de los embeddings.{/snippet}
  {#snippet story()}
    <p>Si la pérdida solo pide "que la predicción se parezca al blanco", existe una solución perfecta e inútil: que el encoder devuelva siempre el mismo vector. Eso es el <b>colapso total</b>. Hay una versión más sutil y más común: el <b>colapso dimensional</b>. Los vectores siguen siendo distintos entre sí, pero todos viven en una línea, o en un plano, dentro de un espacio de 384 dimensiones. La red está usando una fracción de su capacidad.</p>
    <p>Para verlo, toma un lote de embeddings y calcula su <b>matriz de covarianza</b> (F3). Sus <b>autovalores</b> (F1) dicen cuánta varianza hay en cada dirección principal de la nube. Una nube sana tiene muchos autovalores parecidos; una colapsada tiene unos pocos grandes y el resto casi en cero. El <b>rango efectivo</b> lo resume en un número: la exponencial de la entropía (F4) de los autovalores normalizados. Vale d si todas las direcciones se usan por igual y 1 si todo cae en una línea.</p>
  {/snippet}
  {#snippet demo()}<RankDemo />{/snippet}
  {#snippet after()}
    <p>Con esta lente, cada técnica anti-colapso de la guía se entiende como una forma de mantener sanos esos autovalores:</p>
    <ul class="mb-4 list-disc pl-6">
      <li class="mb-1.5"><b>EMA + stop-gradient</b> (BYOL, I-JEPA, V-JEPA). El blanco lo produce un encoder que es un promedio lento de la alumna y no recibe gradiente (F2). La alumna persigue un blanco que no puede "bajar a buscarla". No prohíbe el colapso de forma explícita, pero en la práctica lo evita.</li>
      <li class="mb-1.5"><b>VICReg</b>. Lo escribe en la pérdida: cada coordenada con desviación de al menos 1 (varianza) y coordenadas sin correlación entre sí (covarianza). La demo muestra por qué necesita las dos.</li>
      <li class="mb-1.5"><b>SIGReg</b> (LeJEPA). Pide directamente la forma ideal, una gaussiana isotrópica (F3), y lo comprueba sobre muchas direcciones al azar, no solo sobre los ejes.</li>
      <li><b>Negativos</b> (contrastivos, F7). Empujar vectores de imágenes distintas a separarse impide que todos caigan en el mismo punto.</li>
    </ul>
  {/snippet}
  {#snippet keys()}
    <li><span><b>Colapso total</b>: todos los vectores iguales. <b>Dimensional</b>: vectores distintos, pero en un subespacio pequeño.</span></li>
    <li><span><b>Síntoma</b>: la pérdida JEPA baja muy rápido hacia cero y la sonda lineal no mejora. Vigila siempre el rango efectivo o la desviación de los embeddings durante el entrenamiento.</span></li>
    <li><span><b>EMA</b>: θ<sub>objetivo</sub> ← τ·θ<sub>objetivo</sub> + (1−τ)·θ<sub>contexto</sub>, con τ cerca de 1 (I-JEPA va de 0.996 a 1).</span></li>
    <li><span>En tu fase 2 comparas EMA, VICReg y SIGReg con exactamente estas métricas.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">Σ = (1/(N−1)) Σ<sub>n</sub> (z<sub>n</sub> − z̄)(z<sub>n</sub> − z̄)ᵀ      autovalores λ₁ ≥ … ≥ λ<sub>d</sub></div>
    <div class="eq">rango efectivo = exp( −Σ<sub>i</sub> p<sub>i</sub> log p<sub>i</sub> ),   p<sub>i</sub> = λ<sub>i</sub> / Σ<sub>j</sub> λ<sub>j</sub></div>
    <div class="eq">VICReg<sub>var</sub> = (1/d) Σ<sub>j</sub> máx(0, 1 − std(z<sub>·j</sub>))      VICReg<sub>cov</sub> = (1/d) Σ<sub>i≠j</sub> Σ<sub>ij</sub>²</div>
    <p>Todo se calcula sobre un lote: z<sub>n</sub> es el embedding de la imagen n y z<sub>·j</sub> es la coordenada j de todos. En PyTorch: <code>torch.cov(z.T)</code> y <code>torch.linalg.eigvalsh</code>.</p>
  {/snippet}
  {#snippet deep()}
    <p>Por qué funciona el EMA sigue siendo, en parte, una pregunta abierta. Hay análisis teóricos (por ejemplo, sobre la dinámica de aprendizaje de BYOL y SimSiam) que muestran que el predictor y el stop-gradient crean un equilibrio que no es el colapso, pero dependen de cuidar los hiperparámetros: el momento τ, el tamaño del predictor, la tasa de aprendizaje. Esa fragilidad es exactamente lo que LeJEPA quiere eliminar con un regularizador explícito.</p>
    <p>Una trampa al medir: el rango efectivo depende del tamaño del lote. Con 64 embeddings de 384 dimensiones, la covarianza tiene como mucho 63 autovalores distintos de cero. Mide siempre con lotes más grandes que la dimensión, o compara solo entre corridas medidas igual.</p>
  {/snippet}
  {#snippet bridge()}Con estas ocho herramientas ya puedes leer cualquier paper de la guía. Empezamos por donde empezó todo: <b>BYOL y VICReg</b>.{/snippet}
</Chapter>
