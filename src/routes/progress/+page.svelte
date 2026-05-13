<script lang="ts">
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import ProgressRing from '$lib/components/ProgressRing.svelte';
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { dbService } from '$lib/services/dbService';
  import { i18n } from '$lib/i18n.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';

  // State
  let loading = $state(true);
  let weeklyStats = $state<any[]>([]);
  let recentSessions = $state<any[]>([]);
  let profile = $state<any>(null);

  // Derived Stats
  let totalWeeklyMinutes = $derived(weeklyStats.reduce((acc, curr) => acc + curr.total_minutes, 0));
  let totalWeeklyHours = $derived(totalWeeklyMinutes / 60);
  let maxMinutes = $derived(Math.max(1, Math.max(...weeklyStats.map(d => d.total_minutes))));
  
  // Weekly Goal logic
  let goalProgress = $derived(profile ? (totalWeeklyHours / profile.weekly_goal_hours) * 100 : 0);

  // Formatted Data for Chart
  const daysEn = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const daysDe = ['S', 'M', 'D', 'M', 'D', 'F', 'S'];
  let days = $derived(settingsStore.settings.language === 'de' ? daysDe : daysEn);
  let chartData = $derived(() => {
    const data = new Array(7).fill(0).map((_, i) => ({ day: days[i], minutes: 0 }));
    weeklyStats.forEach(stat => {
      const d = new Date(stat.date).getDay();
      data[d].minutes = stat.total_minutes;
    });
    // Reorder to start with Monday (optional, keeping S-S for now)
    return data;
  });

  let mounted = $state(false);
  onMount(() => { 
    mounted = true; 
    if (authStore.user) loadStats();
  });

  async function loadStats() {
    try {
      loading = true;
      const [stats, sessions, prof] = await Promise.all([
        dbService.getDailyStats(authStore.user!.id, 7),
        dbService.getRecentSessions(authStore.user!.id, 10),
        dbService.getProfile(authStore.user!.id)
      ]);
      
      weeklyStats = stats.data || [];
      recentSessions = sessions.data || [];
      profile = prof.data;
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      loading = false;
    }
  }

  function formatDuration(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}${i18n.t('common.h')} ${m}${i18n.t('common.min')}`;
    return `${m}${i18n.t('common.min')}`;
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const lang = settingsStore.settings.language === 'de' ? 'de-DE' : 'en-US';
    return d.toLocaleDateString(lang, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="p-4 pt-12 space-y-8 pb-28 min-h-screen">
  
  <div>
    <SectionHeader title={i18n.t('progress.title')} subtitle={i18n.t('progress.subtitle')} />
    <div class="mt-2 text-tertiary font-body text-sm font-medium animate-pulse">
      {totalWeeklyHours > (profile?.weekly_goal_hours * 0.5) ? i18n.t('progress.weekly_consistency') : i18n.t('progress.ready_today')}
    </div>
  </div>

  {#if loading}
    <div class="grid grid-cols-2 gap-4">
      <div class="h-40 bg-surface-container-high/40 animate-pulse rounded-3xl"></div>
      <div class="h-40 bg-surface-container-high/40 animate-pulse rounded-3xl"></div>
    </div>
    <div class="h-64 bg-surface-container-high/30 animate-pulse rounded-3xl"></div>
  {:else}
    <!-- Goals & Streak (Top Highlight) -->
    <div class="grid grid-cols-2 gap-4">
      <Card level={2} padding="default" class="flex flex-col items-center justify-center text-center !rounded-3xl glass-shadow">
        <span class="text-on-surface-variant font-body text-sm mb-2">{i18n.t('progress.current_streak')}</span>
        <div class="flex items-baseline gap-1 text-tertiary">
          <span class="text-[3rem] leading-none font-display font-light">{weeklyStats.filter(s => s.total_minutes > 0).length}</span>
          <span class="text-sm font-body">{i18n.t('progress.days')}</span>
        </div>
        <div class="flex gap-1 mt-3">
          {#each [1, 2, 3, 4, 5] as _, i}
            <div class="w-2 h-2 rounded-full {i < weeklyStats.length ? 'bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.5)]' : 'bg-surface-variant'}"></div>
          {/each}
        </div>
      </Card>

      <Card level={1} padding="default" class="flex flex-col items-center justify-center text-center !rounded-3xl border border-white/5 relative overflow-hidden">
        <span class="text-on-surface-variant font-body text-sm mb-2 z-10">{i18n.t('progress.weekly_goal')}</span>
        <div class="z-10 mt-1">
          <ProgressRing progress={mounted ? goalProgress : 0} size={80} strokeWidth={6} color="var(--color-primary)" trackColor="var(--color-surface-container-highest)">
            <div class="flex flex-col items-center">
              <span class="text-xl font-display font-medium text-on-surface">{totalWeeklyHours.toFixed(1)}</span>
              <span class="text-[10px] text-on-surface-variant uppercase tracking-wider">/ {profile?.weekly_goal_hours}h</span>
            </div>
          </ProgressRing>
        </div>
      </Card>
    </div>

    <!-- Weekly Bar Chart -->
    <Card level={1} padding="default" class="border border-white/5 !rounded-3xl">
      <div class="flex justify-between items-end mb-6">
        <span class="text-on-surface font-display font-medium text-lg">{i18n.t('progress.this_week')}</span>
        <span class="text-primary font-body text-sm">{formatDuration(totalWeeklyMinutes)} {i18n.t('progress.total')}</span>
      </div>
      
      <div class="h-40 flex items-end justify-between gap-2 relative">
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div class="border-b border-white/5 w-full"></div>
          <div class="border-b border-white/5 w-full"></div>
          <div class="border-b border-white/5 w-full"></div>
        </div>

        {#each chartData() as day}
          <div class="flex flex-col items-center flex-1 z-10 group">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-surface-container-highest text-xs text-on-surface px-2 py-1 rounded-lg whitespace-nowrap">
              {day.minutes}m
            </div>
            <div 
              class="w-full max-w-[2rem] rounded-t-lg transition-all duration-1000 ease-out {day.minutes === maxMinutes ? 'bg-primary shadow-[0_0_15px_rgba(192,193,255,0.3)]' : 'bg-surface-variant hover:bg-primary/50'}"
              style="height: {mounted ? (day.minutes / maxMinutes) * 100 : 0}%;"
            ></div>
            <span class="text-on-surface-variant text-[10px] mt-2 font-body font-medium uppercase">{day.day}</span>
          </div>
        {/each}
      </div>
    </Card>

    <!-- Monthly Stats -->
    <div class="grid grid-cols-2 gap-4">
      <StatCard title={i18n.t('progress.total_hours')} value={Math.floor(totalWeeklyHours)} subtitle={i18n.t('progress.this_month')} />
      <StatCard title={i18n.t('progress.sessions')} value={recentSessions.length} subtitle={i18n.t('progress.recent_history')} />
    </div>

    <!-- Recent Sessions List -->
    <div>
      <SectionHeader title={i18n.t('progress.recent_sessions')} />
      <div class="space-y-3 mt-4">
        {#each recentSessions as session}
          <Card level={1} padding="default" class="flex items-center justify-between !py-3 hover:bg-surface-container transition-colors border border-transparent hover:border-white/5 cursor-pointer">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>
              </div>
              <div>
                <div class="text-on-surface font-display font-medium text-sm">
                  {session.total_duration ? formatDuration(session.total_duration) : i18n.t('session.active_session')}
                </div>
                <div class="text-on-surface-variant font-body text-xs">{formatDate(session.start_time)}</div>
              </div>
            </div>
            <div class="text-tertiary font-display font-medium">
              {session.total_duration ? i18n.t('common.done') : i18n.t('common.live')}
            </div>
          </Card>
        {:else}
          <div class="text-center py-10 text-on-surface-variant font-body text-sm opacity-50">
            {i18n.t('progress.no_sessions')}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
