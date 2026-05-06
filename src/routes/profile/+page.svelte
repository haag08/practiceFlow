<script lang="ts">
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';
  import { base } from '$app/paths';

  // User Mock Data
  let user = $state({
    name: 'Julian Haag',
    tier: 'Pro Musician',
    instruments: ['Piano', 'Clarinet'],
    goal: 10,
    currentProgress: 7.5
  });

  // Settings State
  let darkMode = $state(true);
  let notifications = $state(true);
  let defaultBpm = $state(120);
  let tuningFreq = $state(440);

  function handleLogout() {
    console.log('Logging out...');
    // Navigation would happen here
  }
</script>

<div class="p-4 pt-12 space-y-8 animate-fade-in pb-28 min-h-screen">
  
  <SectionHeader title="Profile" subtitle="Your musical sanctuary" />

  <!-- 1. Profilbereich oben -->
  <Card level={2} padding="lg" class="flex items-center gap-6 !rounded-[2.5rem] glass-shadow border border-white/5 relative overflow-hidden group">
    <!-- Decorative background glow -->
    <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full transition-transform group-hover:scale-150 duration-700"></div>
    
    <div class="relative">
      <div class="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center text-primary text-3xl font-display font-bold border-2 border-white/5 shadow-inner">
        JH
      </div>
      <div class="absolute bottom-0 right-0 w-6 h-6 bg-tertiary rounded-full border-4 border-[#0a0f1d] flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 text-[#0a0f1d]">
          <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.83-4.401z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <div class="flex-1">
      <h3 class="text-2xl font-display font-bold text-on-surface tracking-tight">{user.name}</h3>
      <p class="text-on-surface-variant font-body text-sm mb-2">{user.tier}</p>
      <div class="flex gap-2">
        {#each user.instruments as inst}
          <span class="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
            {inst}
          </span>
        {/each}
      </div>
    </div>
  </Card>

  <!-- 3. Goals Section -->
  <Card level={1} padding="default" class="border border-white/10 !rounded-3xl">
    <div class="flex items-center justify-between mb-4">
      <span class="text-on-surface font-display font-medium text-lg">Weekly Goal</span>
      <span class="text-tertiary font-body text-sm font-bold">{Math.round((user.currentProgress/user.goal)*100)}%</span>
    </div>
    <div class="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden mb-2">
      <div class="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-1000" style="width: {(user.currentProgress/user.goal)*100}%"></div>
    </div>
    <div class="flex justify-between text-xs text-on-surface-variant font-body">
      <span>{user.currentProgress}h practiced</span>
      <span>Target: {user.goal}h</span>
    </div>
  </Card>

  <!-- 2. Settings Sections -->
  <div class="space-y-6">
    <!-- App Settings -->
    <div>
      <h4 class="text-on-surface-variant font-body text-xs font-bold uppercase tracking-widest mb-3 ml-2">App Settings</h4>
      <Card level={1} padding="none" class="divide-y divide-white/5 border border-white/5 overflow-hidden !rounded-3xl">
        <div class="flex items-center justify-between p-4 px-6">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
            </div>
            <span class="text-on-surface font-body font-medium">Dark Mode</span>
          </div>
          <button 
            onclick={() => darkMode = !darkMode}
            class="w-12 h-6 rounded-full transition-colors relative {darkMode ? 'bg-primary' : 'bg-surface-container-highest'}"
          >
            <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform {darkMode ? 'translate-x-6' : 'translate-x-0'}"></div>
          </button>
        </div>
        <div class="flex items-center justify-between p-4 px-6">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
            </div>
            <span class="text-on-surface font-body font-medium">Notifications</span>
          </div>
          <button 
            onclick={() => notifications = !notifications}
            class="w-12 h-6 rounded-full transition-colors relative {notifications ? 'bg-primary' : 'bg-surface-container-highest'}"
          >
            <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform {notifications ? 'translate-x-6' : 'translate-x-0'}"></div>
          </button>
        </div>
      </Card>
    </div>

    <!-- Music Settings -->
    <div>
      <h4 class="text-on-surface-variant font-body text-xs font-bold uppercase tracking-widest mb-3 ml-2">Music Settings</h4>
      <Card level={1} padding="none" class="divide-y divide-white/5 border border-white/5 overflow-hidden !rounded-3xl">
        <div class="flex items-center justify-between p-4 px-6">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span class="text-on-surface font-body font-medium">Default BPM</span>
          </div>
          <div class="flex items-center gap-3">
            <input type="number" bind:value={defaultBpm} class="w-16 bg-surface-container-lowest border border-white/5 rounded-lg py-1 px-2 text-center text-sm font-display text-primary focus:outline-none focus:border-primary/50" />
            <span class="text-xs text-on-surface-variant font-body">BPM</span>
          </div>
        </div>
        <div class="flex items-center justify-between p-4 px-6">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6.375c0-1.036.84-1.875 1.875-1.875h.375c1.036 0 1.875.84 1.875 1.875v.375c0 1.036-.84 1.875-1.875 1.875h-.375A1.875 1.875 0 0110.5 8.625v-.375z" /><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
            </div>
            <span class="text-on-surface font-body font-medium">Tuning Reference</span>
          </div>
          <div class="flex items-center gap-3">
            <input type="number" step="0.1" bind:value={tuningFreq} class="w-16 bg-surface-container-lowest border border-white/5 rounded-lg py-1 px-2 text-center text-sm font-display text-primary focus:outline-none focus:border-primary/50" />
            <span class="text-xs text-on-surface-variant font-body">Hz</span>
          </div>
        </div>
      </Card>
    </div>
  </div>

  <!-- 4. Account Actions -->
  <div class="space-y-4 pt-4">
    <Button 
      onclick={handleLogout}
      class="w-full h-14 bg-surface-container-highest text-on-surface font-display font-medium border border-white/5 !rounded-2xl hover:bg-error/10 hover:text-error hover:border-error/20 transition-all duration-300 flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
      Logout
    </Button>
    
    <!-- 5. App Info -->
    <div class="text-center space-y-1">
      <p class="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-body font-bold">PracticeFlow v1.0.4</p>
      <p class="text-[10px] text-on-surface-variant/50 font-body">Crafted with precision for musicians</p>
    </div>
  </div>

</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
