  import { settingsStore } from '$lib/stores/settings.svelte';
  import { i18n } from '$lib/i18n.svelte';

  // State
  let loading = $state(true);
  let userData = $state<any>(null);
  let todayMinutes = $state(0);
  let showAvatarModal = $state(false);

  const avatars = [
    '🎻', '🎹', '🎸', '🎺', '🎷', '🥁', '🎤', '🎼', '🎵', '🎶', '🎧', '📻'
  ];

  // Stats Logic
  let goalProgress = $derived(userData ? (todayMinutes / (userData.weekly_goal_hours * 60 / 7)) * 100 : 0);

  $effect(() => {
    if (authStore.user) {
      loadData();
    }
  });

  async function loadData() {
    loading = true;
    const [profile, stats] = await Promise.all([
      dbService.getProfile(authStore.user!.id),
      dbService.getDailyStats(authStore.user!.id, 1)
    ]);
    
    userData = profile.data;
    todayMinutes = stats.data?.[0]?.total_minutes || 0;
    loading = false;
  }

  async function updateProfile(updates: any) {
    if (!authStore.user) return;
    userData = { ...userData, ...updates };
    await dbService.updateProfile(authStore.user.id, updates);
  }

  async function updateSetting(key: string, value: any) {
    await settingsStore.updateSetting(key, value);
  }

  async function handleLogout() {
    await authService.signOut();
    goto(base + '/login');
  }

  async function handlePhotoUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    
    const file = target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${authStore.user!.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await dbService.uploadAvatar(filePath, file);
    if (uploadError) {
      alert('Error uploading photo: ' + uploadError.message);
      return;
    }

    const { data } = dbService.getPublicAvatarUrl(filePath);
    if (data?.publicUrl) {
      await updateProfile({ avatar_url: data.publicUrl });
      showAvatarModal = false;
    }
  }
</script>

<div class="p-4 pt-12 space-y-8 animate-fade-in pb-28 min-h-screen">
  
  <SectionHeader title={i18n.t('profile.title')} subtitle={i18n.t('profile.subtitle')} />

  {#if loading}
    <div class="flex flex-col gap-6">
      <div class="h-32 w-full bg-surface-container-high/50 animate-pulse rounded-[2.5rem]"></div>
      <div class="h-24 w-full bg-surface-container-high/30 animate-pulse rounded-3xl"></div>
      <div class="h-48 w-full bg-surface-container-high/20 animate-pulse rounded-3xl"></div>
    </div>
  {:else if userData}
    <!-- 1. Profilbereich oben -->
    <Card level={2} padding="lg" class="flex items-center gap-6 !rounded-[2.5rem] glass-shadow border border-white/5 relative overflow-hidden group">
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full transition-transform group-hover:scale-150 duration-700"></div>
      
      <div class="relative cursor-pointer group/avatar" onclick={() => showAvatarModal = true}>
        <div class="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface text-3xl font-display font-bold border-2 border-white/5 shadow-inner transition-transform group-hover/avatar:scale-105">
          {#if userData.avatar_url && userData.avatar_url.length < 5}
            {userData.avatar_url}
          {:else if userData.avatar_url}
             <img src={userData.avatar_url} alt="Avatar" class="w-full h-full object-cover rounded-full" />
          {:else}
            {userData.username?.[0].toUpperCase() || 'U'}
          {/if}
        </div>
        <div class="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full border-4 border-[#0a0f1d] flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 text-[#0a0f1d]">
            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.154-1.262a.5.5 0 00.173-.11l10.874-10.874a2.121 2.121 0 10-3-3L2.806 14.59a.5.5 0 00-.111.173z" />
          </svg>
        </div>
      </div>

      <div class="flex-1">
        <h3 class="text-2xl font-display font-bold text-on-surface tracking-tight">{userData.full_name || userData.username}</h3>
        <p class="text-on-surface-variant font-body text-sm mb-2">{i18n.t('profile.member_since')} {new Date(userData.created_at).getFullYear()}</p>
        <div class="flex flex-wrap gap-2">
          {#each userData.instruments as inst}
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
        <span class="text-on-surface font-display font-medium text-lg">{i18n.t('profile.weekly_goal')}</span>
        <span class="text-tertiary font-body text-sm font-bold">{Math.round(goalProgress)}%</span>
      </div>
      <div class="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden mb-2">
        <div class="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-1000" style="width: {goalProgress}%"></div>
      </div>
      <div class="flex justify-between text-xs text-on-surface-variant font-body">
        <span>{todayMinutes}{i18n.t('profile.practiced_today')}</span>
        <div class="flex items-center gap-2">
          <span>{i18n.t('home.target')}:</span>
          <input 
            type="number" 
            value={userData.weekly_goal_hours} 
            onchange={(e) => updateProfile({ weekly_goal_hours: parseInt(e.currentTarget.value) })}
            class="w-12 bg-surface-container-lowest border border-white/5 rounded-lg py-1 px-1 text-center text-xs font-display text-primary focus:outline-none focus:border-primary/50" 
          />
          <span>{i18n.t('profile.h_week')}</span>
        </div>
      </div>
    </Card>

    <!-- 2. Settings Sections -->
    <div class="space-y-6">
      <div>
        <h4 class="text-on-surface-variant font-body text-xs font-bold uppercase tracking-widest mb-3 ml-2">{i18n.t('profile.app_settings')}</h4>
        <Card level={1} padding="none" class="divide-y divide-white/5 border border-white/5 overflow-hidden !rounded-3xl">
          <div class="flex items-center justify-between p-4 px-6">
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
              </div>
              <span class="text-on-surface font-body font-medium">{i18n.t('profile.dark_mode')}</span>
            </div>
            <button 
              onclick={() => updateSetting('dark_mode', !settingsStore.settings.dark_mode)}
              class="w-12 h-6 rounded-full transition-colors relative {settingsStore.settings.dark_mode ? 'bg-primary' : 'bg-surface-container-highest'}"
            >
              <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform {settingsStore.settings.dark_mode ? 'translate-x-6' : 'translate-x-0'}"></div>
            </button>
          </div>
          <div class="flex items-center justify-between p-4 px-6">
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
              </div>
              <span class="text-on-surface font-body font-medium">{i18n.t('profile.notifications')}</span>
            </div>
            <button 
              onclick={() => updateSetting('notifications', !settingsStore.settings.notifications)}
              class="w-12 h-6 rounded-full transition-colors relative {settingsStore.settings.notifications ? 'bg-primary' : 'bg-surface-container-highest'}"
            >
              <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform {settingsStore.settings.notifications ? 'translate-x-6' : 'translate-x-0'}"></div>
            </button>
          </div>

          <!-- Language Selector -->
          <div class="flex items-center justify-between p-4 px-6">
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
              </div>
              <span class="text-on-surface font-body font-medium">{i18n.t('profile.language')}</span>
            </div>
            <select 
              value={settingsStore.settings.language || 'en'} 
              onchange={(e) => updateSetting('language', e.currentTarget.value)}
              class="bg-surface-container-lowest border border-white/5 rounded-lg py-1 px-2 text-sm font-display text-primary focus:outline-none focus:border-primary/50"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </Card>
      </div>

      <div>
        <h4 class="text-on-surface-variant font-body text-xs font-bold uppercase tracking-widest mb-3 ml-2">{i18n.t('profile.music_settings')}</h4>
        <Card level={1} padding="none" class="divide-y divide-white/5 border border-white/5 overflow-hidden !rounded-3xl">
          <div class="flex items-center justify-between p-4 px-6">
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span class="text-on-surface font-body font-medium">{i18n.t('profile.default_bpm')}</span>
            </div>
            <div class="flex items-center gap-3">
              <input 
                type="number" 
                value={settingsStore.settings.default_bpm} 
                onchange={(e) => updateSetting('default_bpm', parseInt(e.currentTarget.value))}
                class="w-16 bg-surface-container-lowest border border-white/5 rounded-lg py-1 px-2 text-center text-sm font-display text-primary focus:outline-none focus:border-primary/50" 
              />
              <span class="text-xs text-on-surface-variant font-body">BPM</span>
            </div>
          </div>
          <div class="flex items-center justify-between p-4 px-6">
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6.375c0-1.036.84-1.875 1.875-1.875h.375c1.036 0 1.875.84 1.875 1.875v.375c0 1.036-.84 1.875-1.875 1.875h-.375A1.875 1.875 0 0110.5 8.625v-.375z" /><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
              </div>
              <span class="text-on-surface font-body font-medium">{i18n.t('profile.tuning_ref')}</span>
            </div>
            <div class="flex items-center gap-3">
              <input 
                type="number" 
                step="0.1" 
                value={settingsStore.settings.tuning_freq} 
                onchange={(e) => updateSetting('tuning_freq', parseFloat(e.currentTarget.value))}
                class="w-16 bg-surface-container-lowest border border-white/5 rounded-lg py-1 px-2 text-center text-sm font-display text-primary focus:outline-none focus:border-primary/50" 
              />
              <span class="text-xs text-on-surface-variant font-body">Hz</span>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <div class="space-y-4 pt-4">
      <Button 
        onclick={handleLogout}
        class="w-full h-14 bg-surface-container-highest text-on-surface font-display font-medium border border-white/5 !rounded-2xl hover:bg-error/10 hover:text-error hover:border-error/20 transition-all duration-300 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
        {i18n.t('common.logout')}
      </Button>
      
      <div class="text-center space-y-1">
        <p class="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-body font-bold">PracticeFlow v1.0.4</p>
        <p class="text-[10px] text-on-surface-variant/50 font-body">Crafted with precision for musicians</p>
      </div>
    </div>
  {/if}

  {#if showAvatarModal}
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-6" transition:fade>
      <div class="absolute inset-0 bg-surface/80 backdrop-blur-sm" onclick={() => showAvatarModal = false}></div>
      <Card level={3} class="w-full max-w-sm !rounded-[2.5rem] glass-shadow border border-white/10 z-10 relative overflow-hidden">
        <div class="p-6 space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-display font-bold">{i18n.t('profile.choose_avatar')}</h3>
            <button onclick={() => showAvatarModal = false} class="text-on-surface-variant hover:text-on-surface">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="grid grid-cols-4 gap-4">
            {#each avatars as avatar}
              <button 
                onclick={() => { updateProfile({ avatar_url: avatar }); showAvatarModal = false; }}
                class="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all"
              >
                {avatar}
              </button>
            {/each}
          </div>

          <div class="pt-4 border-t border-white/5">
            <label class="flex items-center justify-center gap-3 w-full h-14 bg-primary/10 border border-primary/20 text-primary rounded-2xl font-display font-medium cursor-pointer hover:bg-primary/20 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
              {i18n.t('profile.upload_photo')}
              <input type="file" accept="image/*" class="hidden" onchange={handlePhotoUpload} />
            </label>
          </div>
        </div>
      </Card>
    </div>
  {/if}
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
