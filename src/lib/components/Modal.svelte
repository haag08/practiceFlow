<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import Card from './Card.svelte';

  let { 
    show = $bindable(false),
    title = '',
    class: className = '',
    children,
    footer
  }: {
    show?: boolean;
    title?: string;
    class?: string;
    children?: import('svelte').Snippet;
    footer?: import('svelte').Snippet;
  } = $props();

  function close() {
    show = false;
  }
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    onclick={close}
  >
    <div 
      class="w-full max-w-sm"
      onclick={(e) => e.stopPropagation()}
      transition:scale={{ duration: 300, easing: cubicOut, start: 0.95 }}
    >
      <Card level={2} class="relative w-full shadow-2xl glass-shadow {className}">
        {#if title}
          <h3 class="text-xl font-display font-bold text-on-surface mb-4">{title}</h3>
        {/if}
        
        <div class="font-body text-on-surface-variant">
          {#if children}
            {@render children()}
          {/if}
        </div>

        {#if footer}
          <div class="mt-6 pt-4 border-t border-white/5">
            {@render footer()}
          </div>
        {/if}
      </Card>
    </div>
  </div>
{/if}
