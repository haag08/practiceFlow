<script lang="ts">
  import type { Snippet } from 'svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  
  let { 
    children, 
    variant = 'primary', 
    size = 'lg', 
    class: className = '',
    ...props 
  }: {
    children: Snippet;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    class?: string;
    [key: string]: any;
  } = $props();

  // reactive theme flag
  const isDark = settingsStore.settings.dark_mode;

  const baseClasses = 'inline-flex items-center justify-center font-display font-bold transition-all duration-200 active:scale-98';
  
  const sizeClasses = {
    sm: 'h-10 px-4 text-sm rounded-xl',
    md: 'h-12 px-6 text-base rounded-2xl',
    lg: 'h-16 px-8 text-lg rounded-[2rem]'
  };

  const variantClasses = {
    // dark theme: gradient, light theme: solid primary with subtle glow
    primary: isDark
      ? 'bg-gradient-to-br from-primary to-primary-dim text-surface-container-lowest shadow-[0_0_20px_rgba(192,193,255,0.2)] hover:shadow-[0_0_30px_rgba(192,193,255,0.4)]'
      : 'bg-primary text-surface-container-lowest shadow-[0_0_15px_rgba(61,61,184,0.15)] hover:shadow-[0_0_25px_rgba(61,61,184,0.25)]',
    secondary: 'bg-surface-container-high text-primary hover:bg-surface-container-highest',
    ghost: 'text-on-surface-variant hover:text-primary hover:bg-surface-container/50'
  };
</script>

<button class="{baseClasses} {sizeClasses[size]} {variantClasses[variant]} {className}" {...props}>
  {@render children()}
</button>
