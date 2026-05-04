<script lang="ts">
  let { 
    value = $bindable(''), 
    placeholder = '', 
    type = 'text',
    label = '',
    class: className = '',
    ...props 
  }: {
    value?: string | number;
    placeholder?: string;
    type?: string;
    label?: string;
    class?: string;
    [key: string]: any;
  } = $props();
</script>

<div class="flex flex-col gap-2 {className}">
  {#if label}
    <label class="text-sm font-body text-on-surface-variant ml-4">{label}</label>
  {/if}
  <!-- Corners: md (1.5rem). Ghost Border. -->
  <input
    type={type}
    placeholder={placeholder}
    bind:value
    class="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 h-14 px-6 rounded-[1.5rem] ghost-border ghost-border-focus font-body transition-all duration-300"
    {...props}
  />
</div>
