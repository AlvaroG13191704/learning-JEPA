<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    id: string;
    year: string;
    meta: string[];
    title: string;
    oneliner: Snippet;
    story: Snippet;
    demo?: Snippet;
    after?: Snippet;
    keys?: Snippet;
    math?: Snippet;
    deep?: Snippet;
    bridge?: Snippet;
  }
  let { id, year, meta, title, oneliner, story, demo, after, keys, math, deep, bridge }: Props = $props();
</script>

<section {id} class="scroll-mt-6 pt-18">
  <div class="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5 font-mono text-[.78rem] text-muted">
    <span class="font-semibold text-pred">{year}</span>
    {#each meta as m}<span>{m}</span>{/each}
  </div>
  <h2 class="mt-2 mb-1.5 max-w-[22ch] text-[2.4rem] leading-[1.08] font-extrabold tracking-[-.02em]">{title}</h2>
  <p class="oneliner mb-5 max-w-[44ch] font-display text-[1.3rem] leading-[1.3] font-medium text-muted">
    {@render oneliner()}
  </p>
  <div class="prose-col">{@render story()}</div>
  {@render demo?.()}
  {#if after}<div class="prose-col">{@render after()}</div>{/if}

  {#if keys}
    <div class="eyebrow mt-7">Puntos clave</div>
    <ol class="keys my-5 grid max-w-[66ch] gap-2.5">{@render keys()}</ol>
  {/if}
  {#if math}
    <div class="eyebrow mt-7">La matemática mínima</div>
    <div class="math my-3 mb-5 max-w-[66ch] border-l-3 border-pred py-1.5 pl-4">{@render math()}</div>
  {/if}
  {#if deep}
    <details class="deep my-5 max-w-[66ch] border-y border-line">
      <summary class="flex cursor-pointer list-none justify-between gap-3 py-3 font-display font-bold">Más a fondo</summary>
      <div class="pb-3">{@render deep()}</div>
    </details>
  {/if}
  {#if bridge}
    <p class="bridge mt-8 max-w-[60ch] border-t border-dashed border-line py-3.5 font-display text-[.95rem] text-muted">
      {@render bridge()}
    </p>
  {/if}
</section>

<style>
  .oneliner :global(b), .bridge :global(b) { color: var(--ink); }
  .keys { counter-reset: k; }
  .keys :global(li) { display: grid; grid-template-columns: 28px 1fr; gap: 8px; counter-increment: k; }
  .keys :global(li)::before {
    content: counter(k); font-family: var(--mono); font-size: .74rem; color: var(--bg); background: var(--ink);
    border-radius: 50%; width: 22px; height: 22px; display: grid; place-items: center; margin-top: 3px;
  }
  .math :global(.eq) { font-family: var(--mono); font-size: 1rem; overflow-x: auto; white-space: nowrap; padding: 6px 0; }
  .math :global(p) { margin: .3em 0; font-size: .96rem; color: var(--muted); }
  details summary::-webkit-details-marker { display: none; }
  details summary::after { content: "+"; font-family: var(--mono); color: var(--pred); }
  details[open] summary::after { content: "−"; }
  details :global(p) { margin: 0 0 .9em; }
  details :global(.src) { font-family: var(--mono); font-size: .78rem; color: var(--muted); }
</style>
