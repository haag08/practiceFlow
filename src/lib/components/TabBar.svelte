<script lang="ts">
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import { i18n } from '$lib/i18n.svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  
  const tabs = $derived([
    { name: i18n.t('nav.home'), path: '/', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />` },
    { name: i18n.t('nav.metronome'), path: '/metronome', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />` },
    { name: i18n.t('nav.tuner'), path: '/tuner', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />` },
    { name: i18n.t('nav.progress'), path: '/progress', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />` },
    { name: i18n.t('nav.profile'), path: '/profile', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />` }
  ]);
</script>

<div class="fixed bottom-0 left-0 right-0 h-24 lg:top-0 lg:bottom-0 lg:left-0 {uiState.sidebarCollapsed ? 'lg:w-24 lg:px-2' : 'lg:w-64 lg:px-6'} lg:h-screen bg-surface-container-highest/90 backdrop-blur-xl border-t lg:border-t-0 lg:border-r border-white/5 flex lg:flex-col items-center lg:items-start justify-around lg:justify-start px-2 pb-safe lg:pb-0 lg:pt-8 z-50 rounded-t-[2rem] lg:rounded-none transition-all duration-300">
  
  <!-- Toggle Button (Desktop only) -->
  <button 
    onclick={() => uiState.sidebarCollapsed = !uiState.sidebarCollapsed}
    class="hidden lg:flex absolute top-10 -right-4 w-8 h-8 bg-surface-container-highest border border-white/10 rounded-full items-center justify-center text-on-surface hover:text-primary z-50 shadow-md transition-transform hover:scale-110"
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 transition-transform duration-300 {uiState.sidebarCollapsed ? 'rotate-180' : ''}">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  </button>

  <!-- Desktop Logo -->
  <div class="hidden lg:flex w-full mb-12 {uiState.sidebarCollapsed ? 'px-0 justify-center' : 'px-4'} transition-all duration-300 overflow-hidden">
    <h1 class="font-display font-bold text-on-surface tracking-tighter whitespace-nowrap transition-all duration-300 {uiState.sidebarCollapsed ? 'text-[11px]' : 'text-2xl'}">
      Practice<span class="gradient-text">Flow</span>
    </h1>
  </div>

  {#each tabs as tab}
    {@const fullPath = base + (tab.path === '/' ? '' : tab.path)}
    {@const normalizedPath = fullPath.replace(/\/$/, '') || '/'}
    {@const normalizedCurrent = page.url.pathname.replace(/\/$/, '') || '/'}
    {@const isActive = normalizedCurrent === normalizedPath}
    <a 
      href={fullPath || '/'} 
      class="flex flex-col lg:flex-row items-center justify-center lg:justify-start w-16 h-full lg:h-14 gap-1 lg:gap-4 {uiState.sidebarCollapsed ? 'lg:w-14 lg:px-0 lg:justify-center' : 'lg:w-full lg:px-4'} lg:mb-2 lg:rounded-2xl lg:hover:bg-surface-container group transition-all duration-300 {isActive ? 'lg:bg-primary/10' : ''}"
      title={uiState.sidebarCollapsed ? tab.name : undefined}
    >
      <div class="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors {isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant group-hover:text-primary/70'}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={isActive ? "2" : "1.5"} stroke="currentColor" class="w-6 h-6 transition-transform duration-300 {isActive ? 'scale-110' : 'scale-100'}">
          {@html tab.icon}
        </svg>
        {#if isActive}
          <div class="absolute inset-0 rounded-full glass-shadow opacity-50"></div>
        {/if}
      </div>
      <span class="text-[10px] lg:text-sm font-body lg:font-display lg:font-bold transition-colors whitespace-nowrap {isActive ? 'text-primary font-medium' : 'text-on-surface-variant group-hover:text-primary'} {uiState.sidebarCollapsed ? 'lg:hidden' : 'lg:inline'}">
        {tab.name}
      </span>
    </a>
  {/each}
</div>
