<script lang="ts">
  import Rail from './lib/Rail.svelte';
  import { chapters } from './lib/chapters';
  import HeroDemo from './demos/HeroDemo.svelte';
  import Idea from './chapters/Idea.svelte';
  import P0Byol from './chapters/P0Byol.svelte';
  import P1Lecun from './chapters/P1Lecun.svelte';
  import P2Ijepa from './chapters/P2Ijepa.svelte';
  import P3McJepa from './chapters/P3McJepa.svelte';
  import P4Ajepa from './chapters/P4Ajepa.svelte';
  import P5Vjepa from './chapters/P5Vjepa.svelte';
  import P6Vjepa2 from './chapters/P6Vjepa2.svelte';
  import P7LlmJepa from './chapters/P7LlmJepa.svelte';
  import P8LeJepa from './chapters/P8LeJepa.svelte';
  import P9Platonic from './chapters/P9Platonic.svelte';
  import Map from './chapters/Map.svelte';

  const toc = chapters.filter((c) => 'toc' in c);
</script>

<div class="mx-auto grid max-w-[1180px] grid-cols-[200px_minmax(0,1fr)] gap-12 max-[900px]:grid-cols-[minmax(0,1fr)] max-[900px]:gap-0">
  <Rail />
  <main class="min-w-0 pt-6 pb-24">
    <header id="inicio" class="pt-10 pb-6">
      <div class="eyebrow">Una guía narrativa · 10 papers · 2020 → 2026</div>
      <h1 class="mt-2.5 max-w-[14ch] text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.02] font-extrabold tracking-[-.03em]">
        Predecir el <em class="text-pred not-italic">significado</em>, no los píxeles
      </h1>
      <p class="mt-[18px] max-w-[36ch] text-[1.3rem] leading-[1.45]">
        JEPA es una forma de enseñar a una red a entender el mundo sin etiquetas: tapas una parte de los datos y le pides que adivine
        <b>qué hay ahí</b>, no <b>cómo se ve</b> exactamente.
      </p>
      <HeroDemo />
      <ol class="mt-6 grid max-w-[900px] grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5" aria-label="Índice">
        {#each toc as c}
          <li>
            <a href="#{c.id}" class="block h-full rounded-[10px] border border-line bg-surface px-3.5 py-3 text-ink no-underline hover:border-pred">
              <span class="font-mono text-[.72rem] text-muted">{'toc' in c ? c.toc : ''}</span>
              <span class="mt-0.5 block font-display font-bold">{'title' in c ? c.title : ''}</span>
            </a>
          </li>
        {/each}
      </ol>
    </header>

    <Idea />
    <P0Byol />
    <P1Lecun />
    <P2Ijepa />
    <P3McJepa />
    <P4Ajepa />
    <P5Vjepa />
    <P6Vjepa2 />
    <P7LlmJepa />
    <P8LeJepa />
    <P9Platonic />
    <Map />
  </main>
</div>
