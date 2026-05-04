<script lang="ts">
  import type { Snippet } from 'svelte';

  let { 
    children, 
    level = 1,
    padding = 'default',
    class: className = '',
    ...props 
  }: {
    children: Snippet;
    level?: 1 | 2; // Level 1 (Card): surface-container, Level 2 (Active Element): surface-container-highest
    padding?: 'none' | 'sm' | 'default' | 'lg';
    class?: string;
    [key: string]: any;
  } = $props();

  const levelClasses = {
    1: 'bg-surface-container',
    2: 'bg-surface-container-highest'
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  // Rule: Absolutely no dividers. All cards must use lg (2rem) or xl (3rem) corner radius.
  const baseClasses = 'rounded-[2rem] overflow-hidden transition-colors duration-300';
</script>

<div class="{baseClasses} {levelClasses[level]} {paddingClasses[padding]} {className}" {...props}>
  {@render children()}
</div>
