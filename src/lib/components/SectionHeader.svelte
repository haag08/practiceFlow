<script lang="ts">
  let { 
    title,
    subtitle = '',
    class: className = '',
  }: {
    title: string;
    subtitle?: string;
    class?: string;
  } = $props();
</script>

<!-- Asymmetrical margins for editorial feel -->
<div class="mb-6 ml-4 {className}">
  <h2 class="text-2xl font-display font-bold text-on-surface tracking-tight">{title}</h2>
  {#if subtitle}
    <p class="text-on-surface-variant font-body text-sm mt-1">{subtitle}</p>
  {/if}
</div>
