<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  const rows = [
    ['f1', 'Vectores, normas L1/L2, coseno', 'Toda representación es un vector, y toda pérdida JEPA es una distancia entre dos vectores.', 'I-JEPA (L2), V-JEPA y V-JEPA 2-AC (L1), LLM-JEPA (coseno)'],
    ['f2', 'Optimización por gradiente', 'Es cómo aprende la red: bajar la pérdida paso a paso. Stop-gradient solo tiene sentido si sabes qué es un gradiente.', 'todos; stop-gradient en BYOL, I-JEPA, V-JEPA'],
    ['f3', 'Probabilidad y la gaussiana', 'La campana aparece al muestrear acciones, al inicializar pesos y como forma ideal de los embeddings.', 'LeJEPA (gaussiana isotrópica), CEM en V-JEPA 2-AC'],
    ['f4', 'Entropía, cross-entropy y KL', 'La pérdida de los LLMs y de la clasificación; también mide cuántas dimensiones usa una red.', 'LLM-JEPA, contrastivo (InfoNCE), rango efectivo'],
    ['f5', 'Cross-Entropy Method (CEM)', 'Un algoritmo de búsqueda, no una pérdida. Es el planificador de V-JEPA 2-AC.', 'V-JEPA 2-AC, tu fase 5'],
    ['f6', 'Atención, Transformers y ViT', 'Todos los encoders y predictores de la guía son Transformers que trabajan sobre parches.', 'I-JEPA, V-JEPA, A-JEPA, LLM-JEPA'],
    ['f7', 'Contrastivo vs predictivo', 'Ubica a JEPA en el mapa: qué se compara y en qué espacio.', 'BYOL, VICReg, I-JEPA, Hipótesis platónica'],
    ['f8', 'Colapso con números', 'Autovalores, rango efectivo, EMA, VICReg y SIGReg con la misma lente.', 'BYOL, VICReg, LeJEPA, tu fase 2'],
  ];
</script>

<Chapter id="fundamentos" year="Fundamentos" meta={['8 temas', 'antes de los papers']} title="Lo que necesitas tener pulido">
  {#snippet oneliner()}No hace falta un doctorado. Hace falta <b>sentirse cómodo con ocho ideas</b> que los papers dan por sabidas.{/snippet}
  {#snippet story()}
    <p>Los papers de JEPA escriben cosas como "minimizamos la distancia L1 en el espacio latente", "la distribución óptima de los embeddings es una gaussiana isotrópica" o "planificamos con el método de entropía cruzada". Cada frase esconde un concepto que se puede entender con un dibujo. Esta parte de la guía los explica de uno en uno, siempre con un ejemplo de JEPA, y con una demo que puedes tocar.</p>
    <p>El orden importa: cada tema usa los anteriores. Si un tema ya lo dominas, salta al siguiente. Si vas directo a los papers y algo te frena, vuelve aquí: la tabla te dice dónde aparece cada concepto.</p>
    <div class="mt-5 max-w-[900px] overflow-x-auto">
      <table class="w-full border-collapse text-[.95rem]">
        <thead>
          <tr class="font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">
            {#each ['', 'Concepto', 'Por qué lo necesitas', 'Dónde aparece'] as h}<th class="border-b border-line px-2.5 py-2 text-left font-normal">{h}</th>{/each}
          </tr>
        </thead>
        <tbody>
          {#each rows as r}
            <tr>
              <td class="border-b border-line px-2.5 py-2 align-top font-mono text-muted">{r[0].toUpperCase()}</td>
              <td class="border-b border-line px-2.5 py-2 align-top font-display font-semibold"><a href="#{r[0]}">{r[1]}</a></td>
              <td class="border-b border-line px-2.5 py-2 align-top">{r[2]}</td>
              <td class="border-b border-line px-2.5 py-2 align-top text-[.88rem] text-muted">{r[3]}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/snippet}
  {#snippet keys()}
    <li><span><b>Imprescindibles para la fase 1</b> (mini I-JEPA): F1, F2, F6 y F8. Con eso entiendes cada línea del código.</span></li>
    <li><span><b>Para la fase 2</b> (anti-colapso) suma F3 y F4: SIGReg es un test de "¿esto es gaussiano?" y el rango efectivo es una entropía.</span></li>
    <li><span><b>Para la fase 5</b> (planificar con un modelo del mundo) necesitas F5: CEM y control predictivo (MPC).</span></li>
    <li><span>Una trampa de vocabulario: <b>cross-entropy</b> (la pérdida, F4) y <b>Cross-Entropy Method</b> (el planificador, F5) comparten nombre, pero son cosas distintas. F5 explica de dónde viene el parecido.</span></li>
  {/snippet}
  {#snippet deep()}
    <p><b>Chequeo rápido.</b> Si puedes contestar estas preguntas en voz alta, vas bien: ¿Por qué L1 castiga menos los errores grandes que L2? ¿Qué pasa si la tasa de aprendizaje es demasiado alta? ¿Qué significan μ y σ en N(μ, σ²)? ¿Por qué la cross-entropy nunca baja de la entropía? ¿Qué hace CEM con las muestras "élite"? ¿Qué es una consulta, una clave y un valor en la atención? ¿En qué se diferencia JEPA de SimCLR? ¿Qué es el colapso dimensional y qué término de VICReg lo detecta?</p>
    <p><b>Para profundizar</b>, en este orden: <a href="https://www.3blue1brown.com/topics/linear-algebra">Essence of Linear Algebra</a> (3Blue1Brown, vectores y autovalores con animaciones), <a href="https://karpathy.ai/zero-to-hero.html">Neural Networks: Zero to Hero</a> (Karpathy, gradientes y backprop escribiendo código), <a href="https://jalammar.github.io/illustrated-transformer/">The Illustrated Transformer</a> (Jay Alammar), <a href="https://d2l.ai">Dive into Deep Learning</a> (libro gratuito con apéndice de probabilidad e información), <a href="https://lilianweng.github.io/posts/2021-05-31-contrastive/">Contrastive Representation Learning</a> (Lilian Weng) y <a href="https://arxiv.org/abs/2304.12210">A Cookbook of Self-Supervised Learning</a> (Balestriero, LeCun et al.).</p>
  {/snippet}
  {#snippet bridge()}Empecemos por lo más básico de todo: <b>¿qué es una "representación"?</b> Un vector.{/snippet}
</Chapter>
