<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import CemDemo from '../demos/CemDemo.svelte';
</script>

<Chapter id="f5" year="Fundamento 5" meta={['optimización por muestreo', 'V-JEPA 2-AC, tu fase 5']} title="Cross-Entropy Method: planificar sin gradientes">
  {#snippet oneliner()}Prueba muchas ideas al azar, <b>quédate con las mejores</b> y vuelve a probar alrededor de ellas. Repite hasta que todas se parezcan.{/snippet}
  {#snippet story()}
    <p>Primero, el nombre. El <b>Cross-Entropy Method</b> (CEM, método de entropía cruzada) no es la pérdida de cross-entropy de F4. Es un algoritmo para <i>buscar</i> la entrada que hace mínima una función. Lo propuso Reuven Rubinstein a finales de los 90, y el nombre viene de cómo se justifica: en cada vuelta, la nueva gaussiana es la que minimiza la cross-entropy con las mejores muestras, y para una gaussiana eso equivale simplemente a tomar su media y su desviación.</p>
    <p>¿Para qué sirve en JEPA? En V-JEPA 2-AC tienes un predictor que, dado el estado actual y una secuencia de acciones del brazo, imagina la representación del futuro. Quieres las acciones cuyo futuro imaginado quede más cerca de la representación de una <span class="k-tgt">imagen meta</span>. Esa distancia es la <b>energía</b>. CEM la minimiza así:</p>
    <ol class="mb-4 list-decimal pl-6">
      <li>Empieza con una gaussiana sobre las acciones: media μ, desviación σ (F3).</li>
      <li>Saca N secuencias de acciones al azar con a = μ + σ·ε.</li>
      <li>Para cada una, imagina el futuro con el predictor y calcula su energía.</li>
      <li>Quédate con las K de menor energía: las <b>élites</b>.</li>
      <li>Pon la nueva μ en el promedio de las élites y la nueva σ en su dispersión. Vuelve al paso 2.</li>
    </ol>
    <p>Con cada iteración la campana se estrecha alrededor de la mejor zona. Al final, μ es el plan.</p>
  {/snippet}
  {#snippet demo()}<CemDemo />{/snippet}
  {#snippet after()}
    <p>¿Por qué no usar el gradiente de F2, si el predictor es una red diferenciable? Se puede, pero la energía de planificar suele estar llena de valles falsos, y el gradiente cae en el primero que encuentra (el punto rojo de la demo). CEM solo necesita <b>evaluar</b> la energía, no derivarla, explora varias zonas a la vez, y las N evaluaciones se hacen en paralelo en la GPU. Por eso es el planificador clásico de los modelos del mundo.</p>
    <p>Falta una pieza: el <b>control predictivo por modelo</b> (MPC, horizonte receding). El robot planifica varios pasos, ejecuta solo el primero, mira cómo quedó el mundo de verdad y vuelve a planificar desde ahí. Así, los errores del modelo no se acumulan. Es lo que hace la demo 2D del <a href="#p6">capítulo de V-JEPA 2</a>.</p>
  {/snippet}
  {#snippet keys()}
    <li><span>CEM es búsqueda por muestreo, no una pérdida. Solo comparte con la cross-entropy de F4 el origen del nombre.</span></li>
    <li><span>Parámetros: N muestras, K élites, número de iteraciones y horizonte (cuántas acciones planificas hacia el futuro). Más de cada uno = mejor plan y más cómputo.</span></li>
    <li><span>Es aleatorio: a veces se queda en un valle falso. Una σ inicial más ancha explora más.</span></li>
    <li><span>MPC: planificar mucho, ejecutar poco, replanificar siempre.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">E(a₁..a<sub>T</sub>) = ‖ P(s, a₁..a<sub>T</sub>) − s<sub>meta</sub> ‖<sub>1</sub></div>
    <div class="eq">a<sup>(n)</sup> = μ + σ·ε<sup>(n)</sup>   →   élites = las K de menor E   →   μ ← media(élites),  σ ← desv(élites)</div>
    <p>La primera línea es la energía de V-JEPA 2-AC: la distancia L1 (F1) entre el futuro imaginado y la meta, ambos en el espacio de representaciones. La segunda es una vuelta de CEM.</p>
  {/snippet}
  {#snippet deep()}
    <p>La versión que vas a escribir en tu fase 5 cabe en unas 15 líneas: un tensor μ de forma (horizonte, dimensión de la acción), otro σ, <code>torch.randn</code> para las N muestras, una pasada en lote del predictor, <code>topk</code> para las élites, <code>mean</code> y <code>std</code> sobre ellas. Mantén σ por encima de un mínimo pequeño, o la búsqueda se congela antes de tiempo. Y si tus acciones tienen límites (un brazo no puede moverse 2 metros en un paso), recórtalas después de muestrear.</p>
    <p>Hay variantes con nombre propio: MPPI, que en vez de quedarse solo con las élites pondera todas las muestras con exp(−E/temperatura) (otra vez una softmax, F4), y CEM con momento, que mezcla la μ y la σ nuevas con las anteriores (la demo de arriba lo usa).</p>
  {/snippet}
  {#snippet bridge()}Hasta aquí, matemáticas. Ahora, <b>la máquina</b>: cómo es por dentro el encoder que convierte una imagen en vectores.{/snippet}
</Chapter>
