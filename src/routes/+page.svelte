<script lang="ts">
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';
  import ProgressRing from '$lib/components/ProgressRing.svelte';
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { authStore } from '$lib/stores/auth.svelte';
  import { dbService } from '$lib/services/dbService';
  import { i18n } from '$lib/i18n.svelte';

  // State
  let loading = $state(true);
  let profile = $state<any>(null);
  let todayStats = $state({ total_minutes: 0, sessions_count: 0 });
  let streak = $state(0);
  let greetingKey = $state('greeting_evening');

  function getGreetingKey() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'greeting_morning';
    if (hour >= 12 && hour < 18) return 'greeting_afternoon';
    if (hour >= 18 && hour < 22) return 'greeting_evening';
    return 'greeting_night';
  }

  onMount(() => {
    greetingKey = getGreetingKey();
    if (authStore.user) {
      loadHomeData();
    }
  });

  async function loadHomeData() {
    loading = true;
    const [prof, stats, allStats] = await Promise.all([
      dbService.getProfile(authStore.user!.id),
      dbService.getDailyStats(authStore.user!.id, 1),
      dbService.getDailyStats(authStore.user!.id, 30) // For streak
    ]);
    
    const today = new Date().toISOString().split('T')[0];
    profile = prof.data;
    
    // Find today's stats from the data
    todayStats = stats.data?.find((s: any) => s.date === today) || { total_minutes: 0, sessions_count: 0 };
    
    // Calculate streak
    if (allStats.data) {
      streak = calculateStreak(allStats.data);
    }
    
    loading = false;
  }

  function calculateStreak(stats: any[]) {
    if (!stats.length) return 0;
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if started today or yesterday
    const latestDate = stats[0].date;
    if (latestDate !== today && latestDate !== yesterday) return 0;

    for (let i = 0; i < stats.length; i++) {
      if (i === 0) {
        currentStreak = 1;
        continue;
      }
      const prevDate = new Date(stats[i-1].date);
      const currDate = new Date(stats[i].date);
      const diff = (prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24);
      
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  }
  
  const practiceItems = $derived([
    { title: i18n.t('home.warmup'), subtitle: i18n.t('home.warmup_sub'), duration: `10 ${i18n.t('common.min')}`, icon: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.866 8.21 8.21 0 003 2.48z', type: 'warmup' },
    { title: i18n.t('home.technique'), subtitle: i18n.t('home.technique_sub'), duration: `15 ${i18n.t('common.min')}`, icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z', type: 'technique' },
    { title: i18n.t('nav.pieces'), subtitle: 'Concerto No. 1 - Mvt 1', duration: `20 ${i18n.t('common.min')}`, icon: 'M9 19.5v-15m0 0l-5.5 5.5M9 4.5l5.5 5.5M21 15v4.5a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5V15', path: base + '/pieces' }
  ]);

  const quickAccess = [
    { name: 'Metronome', icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z', path: base + '/metronome' },
    { name: 'Tuner', icon: 'M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z', path: base + '/tuner' },
    { name: 'Timer', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', path: base + '/session' }
  ];
</script>

<div class="p-4 lg:p-10 pt-12 space-y-10 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-12 animate-fade-in pb-8 min-h-screen lg:max-w-7xl lg:mx-auto">
  
  <!-- LEFT COLUMN -->
  <div class="space-y-10 lg:col-span-7 flex flex-col">
    <!-- 1. Begrüßung & Streak -->
    <div class="flex items-start justify-between px-2">
      {#if loading}
        <div class="space-y-2">
          <div class="h-8 w-48 bg-surface-container-high/50 animate-pulse rounded-lg"></div>
          <div class="h-4 w-32 bg-surface-container-high/30 animate-pulse rounded-lg"></div>
        </div>
        <div class="w-16 h-16 bg-surface-container-high/50 animate-pulse rounded-2xl"></div>
      {:else}
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface text-2xl border border-white/5 shadow-inner">
            {#if profile?.avatar_url && profile.avatar_url.length < 5}
              {profile.avatar_url}
            {:else if profile?.avatar_url}
              <img src={profile.avatar_url} alt="Avatar" class="w-full h-full object-cover rounded-2xl" />
            {:else}
              {profile?.username?.[0].toUpperCase() || 'M'}
            {/if}
          </div>
          <div>
            <h1 class="text-3xl font-display font-bold text-on-surface tracking-tight mb-0.5">
              {i18n.t('home.' + greetingKey)}, <span class="gradient-text">{profile?.full_name?.split(' ')[0] || profile?.username || 'Musician'}</span>.
            </h1>
            <p class="text-on-surface-variant font-body text-sm opacity-80">{i18n.t('home.ready_session')}</p>
          </div>
        </div>
        
        <div class="flex flex-col items-center bg-surface-container-high px-4 py-2 rounded-2xl glass-shadow hidden lg:flex">
          <span class="text-tertiary font-display font-bold text-xl">{streak}</span>
          <span class="text-[10px] text-on-surface-variant uppercase tracking-wider font-body">{i18n.t('home.streak')}</span>
        </div>
      {/if}
    </div>

    <!-- Overview & Cards -->
    <div class="flex-1">
      {#if loading}
        <div class="px-2 mb-4 h-6 w-32 bg-surface-container-high/30 animate-pulse rounded-lg"></div>
        <div class="space-y-4 px-2">
          <div class="h-24 w-full bg-surface-container-high/20 animate-pulse rounded-3xl"></div>
          <div class="h-24 w-full bg-surface-container-high/20 animate-pulse rounded-3xl"></div>
        </div>
      {:else}
        <SectionHeader title={i18n.t('home.todays_plan')} subtitle="{(todayStats.total_minutes || 0)} / {(profile?.weekly_goal_hours * 60 / 7 | 0)} {i18n.t('common.min_today')}" />
        
        <div class="space-y-4 px-2">
          {#each practiceItems as item}
            <a href="{item.path ? item.path : `${base}/session?type=${item.type}`}" class="block">
              <Card level={1} padding="default" class="flex flex-col relative group cursor-pointer hover:bg-surface-container-high transition-colors !rounded-[2rem]">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-surface-container-highest text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-display font-medium text-on-surface text-lg">{item.title}</h4>
                      <p class="font-body text-sm text-on-surface-variant mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <div class="bg-surface-container-lowest px-3 py-1 rounded-full border border-white/5">
                    <span class="text-xs text-on-surface-variant font-medium">{item.duration}</span>
                  </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-highest overflow-hidden">
                  <div class="h-full w-0 bg-primary/30 rounded-r-full transition-all group-hover:w-1/4"></div>
                </div>
              </Card>
            </a>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Primary Start Button & Focus Quick Select -->
    <div class="px-2 space-y-4 mt-auto">
      <div class="grid grid-cols-2 gap-4">
        {#each ['warmup', 'technique'] as type}
          <a href="{base}/session?type={type}" class="block">
            <Button variant="secondary" class="w-full h-14 !rounded-2xl flex flex-col items-center justify-center gap-1 group relative overflow-hidden !bg-surface-container-highest hover:!bg-primary/20 border border-white/5 transition-all">
              <span class="text-xs font-body font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">{i18n.t('session.' + type)}</span>
            </Button>
          </a>
        {/each}
      </div>

      <a href="{base}/session" class="block w-full">
        <Button class="w-full h-16 lg:h-20 text-lg lg:text-xl shadow-[0_8px_32px_rgba(192,193,255,0.15)] flex items-center justify-center gap-3 relative overflow-hidden group !rounded-2xl lg:!rounded-3xl">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 lg:w-8 lg:h-8">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
          </svg>
          {i18n.t('home.start_session')}
        </Button>
      </a>
    </div>
  </div>

  <!-- RIGHT COLUMN -->
  <div class="space-y-10 lg:col-span-5">
    <!-- Progress Overview -->
    <div class="px-2">
      <Card level={2} padding="lg" class="!rounded-[2.5rem] lg:!rounded-[3rem] glass-shadow border border-white/5 flex flex-row lg:flex-col lg:items-center items-center justify-between lg:justify-center relative overflow-hidden group lg:py-12">
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full lg:w-64 lg:h-64 lg:-top-20 lg:-right-20"></div>
        
        <div class="flex flex-col gap-1 lg:items-center lg:mb-8 lg:z-10">
          <span class="text-on-surface-variant font-body text-xs lg:text-sm font-bold uppercase tracking-widest">{i18n.t('home.todays_progress')}</span>
          <h2 class="text-2xl lg:text-4xl font-display font-bold text-on-surface">
            {todayStats.total_minutes || 0} <span class="text-sm lg:text-lg font-normal text-on-surface-variant">/ {Math.round(profile?.weekly_goal_hours * 60 / 7 || 60)}</span>
          </h2>
          <p class="text-[10px] lg:text-xs text-tertiary font-medium uppercase tracking-wider mt-1">
            {todayStats.sessions_count || 0} {i18n.t('progress.sessions')} {i18n.t('common.done').toLowerCase()}
          </p>
        </div>

        <div class="relative lg:scale-125 lg:z-10">
          <ProgressRing 
            progress={(todayStats.total_minutes / (profile?.weekly_goal_hours * 60 / 7 || 60)) * 100} 
            size={100} 
            strokeWidth={8}
          />
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xs lg:text-sm font-display font-bold text-primary">
              {Math.round((todayStats.total_minutes / (profile?.weekly_goal_hours * 60 / 7 || 60)) * 100)}%
            </span>
          </div>
        </div>
      </Card>
    </div>

    <!-- Quick Access -->
    <div class="lg:mt-auto">
      <SectionHeader title={i18n.t('home.quick_access')} />
      <div class="grid grid-cols-3 lg:grid-cols-2 gap-3 px-2">
        {#each quickAccess as access}
          <a href={access.path} class="flex flex-col lg:flex-row items-center lg:justify-start justify-center gap-3 bg-surface-container-high p-4 lg:py-6 lg:px-6 rounded-[2rem] hover:bg-surface-container-highest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/5">
            <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-inner shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 lg:w-6 lg:h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d={access.icon} />
              </svg>
            </div>
            <span class="font-body text-xs lg:text-sm font-medium text-on-surface-variant text-center lg:text-left leading-tight">{i18n.t('nav.' + access.name.toLowerCase()) !== 'nav.' + access.name.toLowerCase() ? i18n.t('nav.' + access.name.toLowerCase()) : access.name}</span>
          </a>
        {/each}
      </div>
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
  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
</style>
