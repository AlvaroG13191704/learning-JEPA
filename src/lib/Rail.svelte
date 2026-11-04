<script lang="ts">
  import { onMount } from 'svelte';
  import { chapters } from './chapters';

  let active = $state(0);
  let progress = $state(0);

  onMount(() => {
    const secs = chapters.map((c) => document.getElementById(c.id));
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      progress = h > 0 ? (scrollY / h) * 100 : 0;
      let cur = 0;
      secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.35) cur = i; });
      active = cur;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => removeEventListener('scroll', onScroll);
  });
</script>

<div class="fixed inset-x-0 top-0 z-20 h-[3px] pt-[env(safe-area-inset-top,0px)]" aria-hidden="true">
  <i class="block h-[3px] bg-linear-to-r from-ctx via-pred to-tgt" style:width="{progress}%"></i>
</div>

<nav class="sticky top-[calc(env(safe-area-inset-top,0px)+24px)] self-start py-8 font-display max-[900px]:hidden" aria-label="Capítulos">
  <a class="mb-5 block text-[1.05rem] font-extrabold tracking-[-.01em] text-ink no-underline" href="#inicio">Atlas JEPA</a>
  <ol class="border-l border-line">
    {#each chapters as c, i}
      <li>
        <a href="#{c.id}"
          class="-ml-px grid grid-cols-[40px_1fr] gap-1.5 border-l-2 py-[5px] pl-3 text-[.86rem] leading-tight no-underline hover:text-ink
            {active === i ? 'border-pred font-semibold text-ink' : 'border-transparent text-muted'}">
          <span class="pt-0.5 font-mono text-[.72rem]">{c.tag}</span>{c.rail}
        </a>
      </li>
    {/each}
  </ol>
</nav>
