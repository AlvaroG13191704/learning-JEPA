<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import PlatonicDemo from '../demos/PlatonicDemo.svelte';
</script>

<Chapter id="p9" year="29 oct 2026" meta={['Balestriero, LeCun', 'fase 6']} title="Todos los modelos ven el mismo mundo">
  {#snippet oneliner()}Con <b>buenas vistas</b>, JEPAs distintos llegan a la misma representación, salvo una rotación.{/snippet}
  {#snippet story()}
    <p>La "hipótesis de la representación platónica" observa que modelos muy distintos (de visión, de lenguaje) parecen converger hacia representaciones parecidas a medida que crecen, como si todos miraran sombras del mismo mundo real. Este paper, el más reciente de la lista, la demuestra para JEPAs bajo supuestos idealizados.</p>
    <p>La clave es qué cuenta como vistas. <b>Buenas vistas</b> son dos observaciones distintas de la misma escena, como dos captions escritos por personas distintas para la misma foto. <b>Malas vistas</b> son corrupciones de una sola observación, como un caption con palabras tapadas. Según el paper, predecir el siguiente token es un JEPA con malas vistas, y por eso los LLMs solo se alinean con los modelos de visión a fuerza de escala.</p>
  {/snippet}
  {#snippet demo()}<PlatonicDemo />{/snippet}
  {#snippet keys()}
    <li><span>Teorema: con buenas vistas, distintos JEPAs aprenden la misma representación salvo una rotación (bajo supuestos idealizados).</span></li>
    <li><span>Reinterpretación: la predicción del siguiente token usa malas vistas.</span></li>
    <li><span>Resultado: un JEPA de texto de 109 millones de parámetros se alinea con DINOv2 y CLIP mejor que LLMs de hasta 72 mil millones, con unas 42 veces menos muestras.</span></li>
  {/snippet}
  {#snippet math()}
    <div class="eq">f<sub>texto</sub>(x) ≈ R · f<sub>visión</sub>(x),  R rotación</div>
    <p>Una rotación conserva distancias y ángulos: las dos nubes son la misma forma vista desde otro ángulo.</p>
  {/snippet}
  {#snippet deep()}
    <p>Este es el único paper de la lista que no pude leer completo: lo que aparece aquí sale de su resumen en alphaXiv. Conviene leerlo con atención a qué supuestos hace el teorema y cómo mide la alineación entre modelos.</p>
    <p>En tu fase 6 lo pruebas: un JEPA de texto pequeño con buenas vistas (dos captions de una imagen de COCO) contra malas vistas (dos versiones enmascaradas de un caption), y mides cuánto se alinea cada uno con un encoder de imágenes congelado.</p>
    <p class="src">Paper: <a href="https://www.alphaxiv.org/abs/2610.39302">Proving and Improving the Platonic Representation Hypothesis with JEPAs (alphaXiv)</a></p>
  {/snippet}
</Chapter>
