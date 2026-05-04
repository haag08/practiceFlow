<script lang="ts">
  let { 
    progress = 0, // 0 to 100
    size = 120,
    strokeWidth = 8,
    color = 'var(--color-primary)',
    trackColor = 'var(--color-surface-container)',
    class: className = '',
    children
  }: {
    progress?: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
    class?: string;
    children?: import('svelte').Snippet;
  } = $props();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Need to make sure progress doesn't exceed 100 or drop below 0
  let normalizedProgress = $derived(Math.max(0, Math.min(100, progress)));
  let strokeDashoffset = $derived(circumference - (normalizedProgress / 100) * circumference);
</script>

<div class="relative inline-flex items-center justify-center {className}" style="width: {size}px; height: {size}px;">
  <svg class="transform -rotate-90 w-full h-full">
    <!-- Track -->
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      stroke={trackColor}
      stroke-width={strokeWidth}
      fill="transparent"
    />
    <!-- Progress -->
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      stroke={color}
      stroke-width={strokeWidth}
      fill="transparent"
      stroke-dasharray={circumference}
      stroke-dashoffset={strokeDashoffset}
      stroke-linecap="round"
      class="transition-all duration-1000 ease-out"
    />
  </svg>
  
  {#if children}
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      {@render children()}
    </div>
  {/if}
</div>
