<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import SslDiagram from '../demos/SslDiagram.svelte';
  const rows = [
    ['Generativo', 'la entrada (píxeles, tokens)', 'espacio de entrada', 'no', 'no'],
    ['Contrastivo', 'que dos vistas coincidan y otras se separen', 'latente', 'sí', 'sí, aumentos'],
    ['No contrastivo', 'que dos vistas coincidan', 'latente', 'no (EMA o regularizador)', 'sí, aumentos'],
    ['Predictivo (JEPA)', 'la representación de una parte oculta', 'latente', 'no (EMA o regularizador)', 'no, solo máscaras'],
  ];
</script>

<Chapter id="f7" year="Fundamento 7" meta={['aprendizaje auto-supervisado', 'dónde encaja JEPA']} title="Contrastivo, no contrastivo y predictivo">
  {#snippet oneliner()}Sin etiquetas, la red necesita una tarea inventada a partir de los propios datos. <b>Qué tarea eliges</b> decide qué aprende.{/snippet}
  {#snippet story()}
    <p>El aprendizaje auto-supervisado (SSL, por sus siglas en inglés) fabrica la supervisión a partir de los datos: "esta mitad de la imagen y esta otra vienen de la misma foto", "esta palabra venía después de esta frase". Todas las variantes usan las mismas piezas (encoders, a veces un predictor, una pérdida), pero las combinan de cuatro maneras.</p>
    <p>La pregunta que las separa es doble: <b>qué</b> comparas, y <b>en qué espacio</b>. Los generativos comparan en el espacio de entrada (píxeles). Los otros tres comparan en el espacio latente (vectores), y se distinguen por cómo evitan el colapso y por si comparan dos versiones de lo mismo o predicen una parte a partir de otra.</p>
  {/snippet}
  {#snippet demo()}<SslDiagram />{/snippet}
  {#snippet after()}
    <div class="mt-2 max-w-[900px] overflow-x-auto">
      <table class="w-full border-collapse text-[.93rem]">
        <thead>
          <tr class="font-mono text-[.72rem] tracking-[.08em] text-muted uppercase">
            {#each ['Familia', 'Qué predice o compara', 'Dónde mide el error', '¿Negativos?', '¿Aumentos a mano?'] as h}<th class="border-b border-line px-2.5 py-2 text-left font-normal">{h}</th>{/each}
          </tr>
        </thead>
        <tbody>
          {#each rows as r}
            <tr>{#each r as c, i}<td class="border-b border-line px-2.5 py-2 align-top {i === 0 ? 'font-display font-semibold' : ''}">{c}</td>{/each}</tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="mt-4">Los <b>aumentos</b> son las transformaciones que se hacen a mano para crear dos vistas: recortar, voltear, cambiar colores. Funcionan, pero meten un sesgo: le dicen a la red qué cambios "no importan", y eso depende del tipo de dato. Lo que es inofensivo en fotos (cambiar el color) puede destruir la información en imágenes médicas o en audio. JEPA cambia los aumentos por enmascarar, que sirve igual para imágenes, video, audio o texto.</p>
  {/snippet}
  {#snippet keys()}
    <li><span><b>Generativo</b>: no colapsa, pero desperdicia capacidad en detalles impredecibles. MAE y GPT son de esta familia.</span></li>
    <li><span><b>Contrastivo</b>: InfoNCE, que es una cross-entropy (F4) sobre "cuál es mi pareja". Necesita muchos negativos, es decir, lotes grandes.</span></li>
    <li><span><b>No contrastivo</b>: sin negativos. Frena el colapso con asimetría (BYOL) o con reglas sobre la nube de vectores (VICReg). Ver F8.</span></li>
    <li><span><b>Predictivo (JEPA)</b>: no contrastivo, pero con una tarea de <i>predicción</i> entre partes distintas, condicionada por la posición de lo oculto.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">InfoNCE = −log [ exp(cos(z, z⁺)/τ) / Σ<sub>k</sub> exp(cos(z, z<sub>k</sub>)/τ) ]</div>
    <p>z⁺ es la pareja de z (la otra vista de la misma imagen) y la suma recorre la pareja y todos los negativos del lote. τ es una temperatura. Es exactamente −log softmax: la cross-entropy de un clasificador cuya respuesta correcta es la pareja.</p>
  {/snippet}
  {#snippet deep()}
    <p>LeCun prefiere llamar "métodos de energía" a todo esto. La energía es baja para pares compatibles (contexto y su parte oculta) y alta para incompatibles. Los métodos contrastivos <i>suben</i> la energía de los pares incompatibles empujando negativos; los regularizados limitan el volumen de espacio que puede tener energía baja, así no hace falta buscar negativos. JEPA, en su visión, es de los segundos. Lo verás en el <a href="#p1">capítulo de LeCun</a>.</p>
    <p class="src">Panorama completo y práctico: <a href="https://arxiv.org/abs/2304.12210">A Cookbook of Self-Supervised Learning (arXiv 2304.12210)</a> · <a href="https://lilianweng.github.io/posts/2021-05-31-contrastive/">Contrastive Representation Learning (Lilian Weng)</a></p>
  {/snippet}
  {#snippet bridge()}Tres de las cuatro familias comparten un riesgo. Último fundamento: <b>el colapso, con números</b>.{/snippet}
</Chapter>
