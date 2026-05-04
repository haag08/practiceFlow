<script lang="ts">
  import type { Snippet } from 'svelte';

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

  const baseClasses = 'inline-flex items-center justify-center font-display font-bold transition-all duration-200 active:scale-98';
  
  const sizeClasses = {
    sm: 'h-10 px-4 text-sm rounded-xl',
    md: 'h-12 px-6 text-base rounded-2xl',
    lg: 'h-16 px-8 text-lg rounded-[2rem]' // from spec: lg (2rem) rounded corners
  };

  const variantClasses = {
    primary: 'bg-gradient-to-br from-primary to-primary-dim text-surface-container-lowest shadow-[0_0_20px_rgba(192,193,255,0.2)] hover:shadow-[0_0_30px_rgba(192,193,255,0.4)]',
    secondary: 'bg-surface-container-high text-primary hover:bg-surface-container-highest',
    ghost: 'text-on-surface-variant hover:text-primary hover:bg-surface-container/50'
  };
</script>

<button class="{baseClasses} {sizeClasses[size]} {variantClasses[variant]} {className}" {...props}>
  {@render children()}
</button>
