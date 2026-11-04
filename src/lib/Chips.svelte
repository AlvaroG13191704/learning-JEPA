<script lang="ts" generics="T extends string">
  /** Grupo de botones de opción exclusiva (aria-pressed). */
  interface Props { options: { value: T; label: string }[]; value: T; label: string }
  let { options, value = $bindable(), label }: Props = $props();
</script>

<div class="controls" role="group" aria-label={label}>
  {#each options as o}
    <button class="chip" aria-pressed={value === o.value} onclick={() => (value = o.value)}>{o.label}</button>
  {/each}
</div>
