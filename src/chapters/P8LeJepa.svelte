<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import SigregDemo from '../demos/SigregDemo.svelte';
</script>

<Chapter id="p8" year="2025" meta={['Balestriero, LeCun', 'fase 2']} title="LeJEPA: JEPA sin trucos">
  {#snippet oneliner()}Demuestran cuál es la forma ideal de la nube de embeddings (<b>una gaussiana isotrópica</b>) y añaden una pérdida que la empuja hacia ahí.{/snippet}
  {#snippet story()}
    <p>Hasta ahora, evitar el colapso era un arte: EMA con el momento justo, stop-gradient, un predictor con el tamaño correcto. Si algo fallaba, el entrenamiento colapsaba sin aviso. LeJEPA cambia el arte por un teorema.</p>
    <p>Prueban que, si no sabes de antemano qué tareas se harán con los embeddings, la distribución que minimiza el error esperado es una <b>gaussiana isotrópica</b>: una nube redonda, igual de ancha en todas las direcciones. Luego proponen SIGReg, una forma barata de comprobar si la nube es gaussiana: la proyectan sobre muchas direcciones al azar y comprueban que cada sombra 1D tenga forma de campana. Si no, la pérdida la corrige.</p>
  {/snippet}
  {#snippet demo()}<SigregDemo />{/snippet}
  {#snippet keys()}
    <li><span>Una justificación teórica de qué forma deben tener los embeddings.</span></li>
    <li><span>SIGReg (Sketched Isotropic Gaussian Regularization): proyecciones aleatorias + un test estadístico de normalidad.</span></li>
    <li><span>Fuera EMA, stop-gradient y maestro-alumno. Queda un solo hiperparámetro de compromiso y unas 50 líneas de código.</span></li>
    <li><span>Entrenamiento estable en muchas arquitecturas y tamaños; la pérdida de entrenamiento se correlaciona con la calidad final, así que sirve para saber si vas bien.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">pérdida = (1−λ)·pérdida<sub>predicción</sub> + λ·SIGReg</div>
    <div class="eq">SIGReg = promedio<sub>direcciones u</sub> test_normalidad( u·z₁, u·z₂, …, u·z<sub>N</sub> )</div>
    <p>Para cada dirección u, proyectas todos los embeddings y mides qué tan lejos está esa sombra de una campana de media 0 y varianza 1.</p>
  {/snippet}
  {#snippet deep()}
    <p>El test que usan es Epps-Pulley, que compara funciones características (una especie de transformada de Fourier de la distribución). Es diferenciable y tiene complejidad lineal en el tamaño del lote. Las direcciones se vuelven a muestrear en cada paso.</p>
    <p>En tu fase 2 esto es el experimento central: reemplazas EMA por SIGReg en tu mini I-JEPA y comparas sonda lineal y rango efectivo. La demo de BYOL/VICReg y esta miden lo mismo desde dos ángulos.</p>
    <p class="src">Paper: busca "LeJEPA: Provable and Scalable Self-Supervised Learning Without the Heuristics" en <a href="https://arxiv.org/">arXiv</a></p>
  {/snippet}
  {#snippet bridge()}Si ya sabemos qué forma deben tener los embeddings, una pregunta más grande aparece: <b>¿todos los modelos terminan aprendiendo lo mismo?</b>{/snippet}
</Chapter>
