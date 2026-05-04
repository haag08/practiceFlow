<script lang="ts">
  import Card from './Card.svelte';

  let { 
    title,
    value,
    subtitle = '',
    highlight = false,
    class: className = '',
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    highlight?: boolean;
    class?: string;
  } = $props();
</script>

<Card level={highlight ? 2 : 1} padding="default" class="flex flex-col items-start {className}">
  <span class="text-on-surface-variant font-body text-sm font-medium mb-2">{title}</span>
  
  <!-- display-lg: 3.5rem, Manrope -->
  <span class="text-[3.5rem] leading-none font-display font-light {highlight ? 'gradient-text font-medium' : 'text-on-surface'}">
    {value}
  </span>
  
  {#if subtitle}
    <span class="text-on-surface-variant/70 font-body text-xs mt-2">{subtitle}</span>
  {/if}
</Card>
