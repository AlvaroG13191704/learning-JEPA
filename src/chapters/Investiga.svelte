<script lang="ts">
  import Chapter from '../lib/Chapter.svelte';
  import Chips from '../lib/Chips.svelte';

  type Tier = 'cpu' | 'colab' | 'gpu';
  const tierName: Record<Tier, string> = { cpu: 'portátil (CPU)', colab: 'GPU gratuita (Colab, Kaggle)', gpu: 'GPU propia 12–24 GB' };
  const projects: { t: string; tier: Tier; q: string; how: string; measure: string; ch: string; chName: string }[] = [
    { t: 'Provoca el colapso y míralo', tier: 'colab', ch: 'f8', chName: 'F8 · Colapso',
      q: '¿Cuánto tarda en colapsar un mini I-JEPA si quito el EMA, el stop-grad o el predictor?',
      how: 'ViT-Tiny sobre CIFAR-10 a 32 px con parches de 4 (64 tokens). Entrena la versión correcta y tres versiones rotas.',
      measure: 'Rango efectivo de los embeddings en cada época, precisión de un probe lineal y de kNN.' },
    { t: 'EMA contra SIGReg en pequeño', tier: 'colab', ch: 'p8', chName: 'P8 · LeJEPA',
      q: '¿El regularizador de LeJEPA sigue funcionando con batches pequeños y pocos datos?',
      how: 'Mismo mini I-JEPA, cambiando solo el mecanismo anti-colapso. Barre el tamaño de batch (64, 128, 256).',
      measure: 'Probe lineal, rango efectivo y estabilidad entre 3 semillas.' },
    { t: 'Un modelo del mundo en un gridworld', tier: 'cpu', ch: 'p6', chName: 'P6 · V-JEPA 2',
      q: '¿Puedo planificar solo con representaciones, sin reconstruir la pantalla?',
      how: 'Un juego 2D propio. Encoder pequeño, predictor (z, a) → z′ y planificación con CEM hacia una imagen meta.',
      measure: 'Error de predicción a 1, 5 y 10 pasos, y porcentaje de metas alcanzadas.' },
    { t: 'Contrafácticos en tu propio simulador', tier: 'cpu', ch: 'p10', chName: 'P10 · Contrafácticos',
      q: '¿A partir de qué duración o con qué contactos deja de valer la regla del residuo?',
      how: 'Un simulador 2D (una bola con viento oculto). Extrae una vez las features de un encoder congelado, guárdalas en disco y entrena solo el predictor.',
      measure: 'R² contrafáctico frente a h, con y sin colisiones contra paredes.' },
    { t: 'Sondea un V-JEPA 2 congelado', tier: 'gpu', ch: 'p6', chName: 'P6 · V-JEPA 2',
      q: '¿Qué física intuitiva (velocidad, dirección, permanencia de objetos) se puede leer linealmente de sus features?',
      how: 'Extrae features de clips cortos propios con el checkpoint más pequeño disponible. Solo entrenas probes lineales encima.',
      measure: 'Precisión de cada probe frente a un baseline de features aleatorias o de un encoder de imágenes.' },
    { t: 'Buenas contra malas vistas en texto', tier: 'colab', ch: 'p9', chName: 'P9 · Platónica',
      q: '¿Un JEPA de texto pequeño se alinea más con un encoder de imágenes si lo entreno con dos captions de la misma foto?',
      how: 'Captions de COCO. Versión A: dos captions de la misma imagen. Versión B: dos versiones enmascaradas de un caption.',
      measure: 'Alineación por vecinos mutuos (mutual kNN) con DINOv2 congelado, a igual número de muestras.' },
    { t: 'Diseña el enmascarado de otra modalidad', tier: 'gpu', ch: 'p4', chName: 'P4 · A-JEPA',
      q: '¿Qué máscara funciona en series temporales (ECG, sensores, mercados)?',
      how: 'Compara máscaras aleatorias, bloques contiguos y bloques multi-escala en un dataset público de ECG.',
      measure: 'Probe lineal sobre una tarea de clasificación del dataset y rango efectivo.' },
  ];
  let tier = $state<'all' | Tier>('all');
  const shown = $derived(projects.filter((p) => tier === 'all' || p.tier === tier));
</script>

<Chapter id="investiga" year="Tu laboratorio" meta={['proyectos', 'preguntas abiertas', 'método']} title="Investiga tú mismo las fronteras de JEPA">
  {#snippet oneliner()}No hace falta un clúster. Las preguntas abiertas de JEPA <b>se pueden explorar en pequeño</b>, con un portátil o una GPU gratuita, si eliges bien la escala.{/snippet}
  {#snippet story()}
    <p>Los papers de esta guía usan miles de GPUs, pero casi todas sus ideas centrales caben en un experimento de juguete: el colapso aparece en CIFAR-10, la planificación en un gridworld, la regla contrafáctica en un simulador de una bola. Investigar a nivel personal no es repetir sus números, sino <b>hacerte una pregunta concreta que el paper deja abierta y responderla en pequeño</b>, con control.</p>
    <p>Un truco que usan los propios autores, y que a ti te ahorra casi todo el cómputo: trabajar con <b>encoders congelados</b>. El paper de contrafácticos entrena sus modelos del mundo sobre DINOv2 y MAE congelados. Si extraes las features una vez y las guardas en disco, entrenar un predictor encima cabe en un portátil.</p>
  {/snippet}
  {#snippet demo()}
    <figure class="demo">
      <div class="demo-head"><h3>Elige un primer proyecto según tu equipo</h3><span class="hint">el cómputo es orientativo</span></div>
      <Chips label="Equipo disponible" bind:value={tier} options={[
        { value: 'all', label: 'Todos' },
        { value: 'cpu', label: 'Portátil' },
        { value: 'colab', label: 'GPU gratuita' },
        { value: 'gpu', label: 'GPU propia' },
      ]} />
      <ol class="mt-4 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
        {#each shown as p}
          <li class="flex flex-col gap-1.5 rounded-xl border border-line bg-paper p-3.5">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-display font-bold">{p.t}</span>
              <span class="font-mono text-[.68rem] text-muted">{tierName[p.tier]}</span>
            </div>
            <p class="text-[.95rem]"><b>Pregunta:</b> {p.q}</p>
            <p class="text-[.9rem] text-muted"><b class="text-ink">Cómo:</b> {p.how}</p>
            <p class="text-[.9rem] text-muted"><b class="text-ink">Mide:</b> {p.measure}</p>
            <a class="mt-auto font-mono text-[.74rem]" href="#{p.ch}">repasa {p.chName}</a>
          </li>
        {/each}
      </ol>
      <figcaption>Empieza por uno de portátil o GPU gratuita aunque tengas más equipo: el objetivo del primer proyecto es cerrar el ciclo completo (pregunta, experimento, nota escrita), no la escala.</figcaption>
    </figure>
  {/snippet}
  {#snippet after()}
    <h3 class="mt-6 mb-2 text-[1.25rem] font-bold">Preguntas abiertas que salen de esta guía</h3>
    <ul class="mb-4 grid gap-2 pl-5 [list-style:disc]">
      <li><b>¿Dónde se rompe la regla del residuo?</b> El paper de contrafácticos da la teoría (O(h²)) y nombra los casos de fallo. Medir el horizonte crítico en sistemas con contactos o fricción es una pregunta concreta y barata.</li>
      <li><b>¿Qué es una "buena vista" fuera de imagen y texto?</b> La hipótesis platónica pide observaciones distintas del mismo estado del mundo. En audio, sensores o video, ¿qué pares cumplen eso?</li>
      <li><b>¿Cuánto aguanta SIGReg en pequeño?</b> LeJEPA elimina las heurísticas, pero sus experimentos son grandes. Su comportamiento con poco dato y batches pequeños es justo lo que puedes probar.</li>
      <li><b>Errores que se acumulan al planificar lejos.</b> V-JEPA 2-AC planifica a horizontes cortos. ¿Cómo crece el error del predictor con los pasos, y qué lo frena?</li>
      <li><b>¿Qué saben los encoders congelados?</b> Probes lineales sobre V-JEPA 2 para velocidad, oclusión o causalidad. Es la misma idea que usan los trabajos que predicen actividad cerebral desde sus features.</li>
    </ul>

    <h3 class="mt-6 mb-2 text-[1.25rem] font-bold">Un método que funciona con poco tiempo</h3>
    <ol class="mb-4 grid gap-2 pl-5 [list-style:decimal]">
      <li><b>Reproduce algo pequeño antes de cambiar nada.</b> Un baseline que funciona es tu punto de comparación.</li>
      <li><b>Cambia una sola variable</b> y corre al menos 3 semillas. Si la diferencia es menor que la variación entre semillas, no hay resultado.</li>
      <li><b>Mide más que la pérdida.</b> En JEPA la pérdida baja incluso cuando colapsa. Usa probe lineal, kNN y rango efectivo de los embeddings; en modelos del mundo, error a k pasos y éxito al planificar.</li>
      <li><b>Registra todo</b> (configuración, semilla, commit) en un CSV o en TensorBoard, dentro de este repo.</li>
      <li><b>Escribe una nota corta</b> por experimento: hipótesis, resultado, sorpresa. Tras unas cuantas, ya tienes un informe técnico que puedes publicar.</li>
    </ol>

    <h3 class="mt-6 mb-2 text-[1.25rem] font-bold">Mantenerte al día</h3>
    <p>Busca "JEPA" en <a href="https://arxiv.org/search/?query=JEPA&searchtype=all&order=-announced_date_first">arXiv, ordenado por fecha</a> una vez por semana. Lee cada paper en tres pasadas: resumen y figuras, luego método, y solo si te sirve, las pruebas. Para cada paper que te guste, intenta convertir su figura principal en una demo de juguete, como las de este Atlas: si no puedes, todavía no lo entiendes del todo.</p>
  {/snippet}
  {#snippet keys()}
    <li><span>Elige una pregunta que el paper deja abierta, no un número que quieras igualar.</span></li>
    <li><span>Escala pequeña y encoders congelados: así una idea cabe en una tarde.</span></li>
    <li><span>La pérdida engaña en JEPA. Siempre mide la calidad de la representación aparte.</span></li>
  {/snippet}
  {#snippet deep()}
    <p>Consejos de cómputo: en CIFAR-10 a 32 px con parches de 4, un ViT-Tiny procesa 64 tokens por imagen, lo bastante poco para una GPU gratuita. Usa precisión mixta (bf16 o fp16), guarda checkpoints a menudo porque las sesiones gratuitas se cortan, y cachea en disco las features de cualquier encoder congelado.</p>
    <p>Código para empezar, todo público: <a href="https://github.com/facebookresearch/ijepa">I-JEPA</a>, <a href="https://github.com/facebookresearch/jepa">V-JEPA</a>, <a href="https://github.com/facebookresearch/vjepa2">V-JEPA 2</a>, <a href="https://github.com/facebookresearch/eb_jepa">EB-JEPA</a> (ejemplos didácticos de imagen, video, video con acciones y planificación), <a href="https://github.com/galilai-group/lejepa">LeJEPA</a> y <a href="https://github.com/galilai-group/counterfactual-WM">Counterfactual World Models</a>.</p>
    <p class="src">Las estimaciones de cómputo de esta sección son orientativas: dependen del tamaño de modelo, las épocas y la GPU que te toque.</p>
  {/snippet}
</Chapter>
