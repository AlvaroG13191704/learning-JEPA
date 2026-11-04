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
    <li><span>Fuera EMA, stop-gradient, maestro-alumno y programaciones de hiperparámetros; en su ablación también sobra el predictor. Queda un solo hiperparámetro de compromiso (recomiendan λ = 0.05) y unas 50 líneas de código.</span></li>
    <li><span>Entrenamiento estable en más de 60 arquitecturas (ResNets, ViTs, ConvNets) hasta un ViT-g de 1.8 mil millones de parámetros; la pérdida de entrenamiento se correlaciona con la calidad final (94.5 % de correlación de Spearman en uno de sus ejemplos), así que sirve para saber si vas bien. Con un ViT-H/14 pre-entrenado en ImageNet-1K llega a 79 % en evaluación lineal.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">pérdida = (1−λ)·pérdida<sub>predicción</sub> + λ·SIGReg</div>
    <div class="eq">pérdida<sub>predicción</sub> = promedio<sub>vistas v</sub> ‖ μ − z<sub>v</sub> ‖²,  μ = media de las vistas globales</div>
    <div class="eq">SIGReg = promedio<sub>direcciones u</sub> test_normalidad( u·z₁, u·z₂, …, u·z<sub>N</sub> )</div>
    <p>La predicción es al estilo DINO: de cada imagen salen varias vistas recortadas (algunas globales, otras locales) y todas deben acercarse al centro de las globales. Para SIGReg, en cada dirección u proyectas todos los embeddings y mides qué tan lejos está esa sombra de una campana de media 0 y varianza 1.</p>
  {/snippet}
  {#snippet deep()}
    <p>El test que usan es Epps-Pulley, que compara funciones características (una especie de transformada de Fourier de la distribución). Es diferenciable, con gradiente acotado, y tiene complejidad lineal en el tamaño del lote. Usan 256 direcciones por defecto y las vuelven a muestrear en cada paso.</p>
    <p>Ojo con una diferencia respecto de I-JEPA: LeJEPA, tal como lo presenta el paper, usa vistas aumentadas (recortes) y no enmascarado. En tu fase 2 esto es el experimento central: reemplazas EMA por SIGReg en tu mini I-JEPA (una combinación tuya, no la del paper) y comparas sonda lineal y rango efectivo. La demo de BYOL/VICReg y esta miden lo mismo desde dos ángulos.</p>
    <p class="src">Paper: <a href="https://arxiv.org/abs/2511.08544">LeJEPA (arXiv 2511.08544)</a></p>
  {/snippet}
  {#snippet bridge()}Si ya sabemos qué forma deben tener los embeddings, una pregunta más grande aparece: <b>¿todos los modelos terminan aprendiendo lo mismo?</b>{/snippet}
</Chapter>
