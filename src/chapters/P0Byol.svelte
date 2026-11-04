<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import CollapseDemo from '../demos/CollapseDemo.svelte';
</script>

<Chapter id="p0" year="2020–2021" meta={['Grill et al. (DeepMind) · Bardes, Ponce, LeCun (Meta)', 'contexto previo']} title="BYOL y VICReg: cómo no colapsar">
  {#snippet oneliner()}Dos recetas para que la red no haga trampa: <b>un maestro que cambia lento</b> (BYOL) o <b>reglas explícitas sobre la dispersión</b> de los vectores (VICReg).{/snippet}
  {#snippet story()}
    <p>Antes de JEPA, el aprendizaje auto-supervisado tomaba una imagen, le hacía dos "aumentos" (recortar, cambiar colores, girar) y pedía que las dos versiones dieran el mismo vector. El problema: la forma más fácil de cumplirlo es mandar todas las imágenes al mismo punto.</p>
    <p><b>BYOL</b> lo resolvió con una asimetría. Hay una red "alumna" que aprende con gradientes y una red "maestra" que no aprende directamente: es un promedio lento (EMA) de las versiones pasadas de la alumna. La alumna, además, tiene un predictor extra. Nadie demostró del todo por qué funciona, pero funciona, y JEPA heredó este truco.</p>
    <p><b>VICReg</b> fue más directo: si no queremos que colapse, lo escribimos en la pérdida. Cada dimensión del vector debe variar entre imágenes (varianza) y las dimensiones no deben repetir la misma información (covarianza).</p>
  {/snippet}
  {#snippet demo()}<CollapseDemo />{/snippet}
  {#snippet keys()}
    <li><span>El colapso es el enemigo número uno de cualquier método que compara representaciones.</span></li>
    <li><span>BYOL: maestro = media móvil de la alumna (EMA) + <i>stop-gradient</i> (no se propaga el error hacia el maestro). I-JEPA y V-JEPA usan exactamente esto.</span></li>
    <li><span>VICReg: tres términos con nombres que se explican solos. Varianza, Invarianza, Covarianza.</span></li>
    <li><span>Ambos dependen de aumentos hechos a mano; JEPA los reemplaza por <b>enmascarar</b>.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">EMA: θ<sub>maestro</sub> ← τ·θ<sub>maestro</sub> + (1−τ)·θ<sub>alumna</sub>,  τ ≈ 0.996</div>
    <p>El maestro cambia muy despacio: es como una versión "promediada" de la alumna.</p>
    <div class="eq">VICReg = λ·‖z − z′‖² + μ·máx(0, 1 − std(z)) + ν·Σ cov(z)²<sub>fuera de la diagonal</sub></div>
    <p>Invarianza (que coincidan), varianza (que no se aplasten), covarianza (que no se repitan).</p>
  {/snippet}
  {#snippet deep()}
    <p>BYOL sorprendió porque no usa ejemplos negativos. SimCLR y MoCo empujaban activamente imágenes distintas a separarse, lo que pide lotes grandes. BYOL demostró que la asimetría (predictor solo en la alumna + EMA + stop-gradient) basta para evitar el colapso en la práctica.</p>
    <p>VICReg aplica el término de varianza a cada dimensión por separado sobre el lote: pide que la desviación estándar de cada coordenada no baje de 1. El de covarianza penaliza que dos coordenadas estén correlacionadas, lo que evita el "colapso dimensional", donde los puntos no caen en uno solo pero sí en una línea. En tu proyecto, la fase 2 compara exactamente EMA contra VICReg contra SIGReg.</p>
    <p class="src">Papers: <a href="https://arxiv.org/abs/2006.07733">BYOL (arXiv 2006.07733)</a> · <a href="https://arxiv.org/abs/2105.04906">VICReg (arXiv 2105.04906)</a></p>
  {/snippet}
  {#snippet bridge()}Ya sabemos qué puede salir mal. Ahora, <b>¿para qué querríamos todo esto?</b> LeCun responde con un plano completo.{/snippet}
</Chapter>
