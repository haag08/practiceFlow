<script lang="ts">
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import ProgressRing from '$lib/components/ProgressRing.svelte';
  import { onMount } from 'svelte';

  // Mock Data
  let weeklyData = $state([
    { day: 'M', minutes: 45 },
    { day: 'T', minutes: 120 },
    { day: 'W', minutes: 0 },
    { day: 'T', minutes: 60 },
    { day: 'F', minutes: 90 },
    { day: 'S', minutes: 150 },
    { day: 'S', minutes: 30 }
  ]);

  let maxMinutes = $derived(Math.max(1, Math.max(...weeklyData.map(d => d.minutes))));

  let recentSessions = $state([
    { id: 1, date: 'Today, 10:00 AM', duration: '45m', instrument: 'Piano', type: 'Technique' },
    { id: 2, date: 'Yesterday, 6:30 PM', duration: '1h 20m', instrument: 'Clarinet', type: 'Repertoire' },
    { id: 3, date: 'Tue, 4:15 PM', duration: '30m', instrument: 'Piano', type: 'Sight Reading' },
    { id: 4, date: 'Mon, 8:00 PM', duration: '1h', instrument: 'Clarinet', type: 'Ensemble Prep' },
  ]);

  // Calendar Mock (last 35 days for a 5 week grid)
  // 0 = no practice, 1 = light, 2 = medium, 3 = heavy
  const activityMap = [
    0, 1, 2, 0, 3, 1, 2,
    1, 1, 0, 2, 2, 3, 1,
    2, 3, 1, 1, 0, 2, 2,
    1, 2, 3, 1, 2, 1, 0,
    3, 2, 0, 1, 2, 3, 1
  ];

  let mounted = $state(false);
  onMount(() => { mounted = true; });
</script>

<div class="p-4 pt-12 space-y-8 pb-28 min-h-screen">
  
  <div>
    <SectionHeader title="Progress" subtitle="Your musical journey" />
    <div class="mt-2 text-tertiary font-body text-sm font-medium animate-pulse">
      "Great consistency this week! Keep it up."
    </div>
  </div>

  <!-- Goals & Streak (Top Highlight) -->
  <div class="grid grid-cols-2 gap-4">
    <Card level={2} padding="default" class="flex flex-col items-center justify-center text-center !rounded-3xl glass-shadow">
      <span class="text-on-surface-variant font-body text-sm mb-2">Current Streak</span>
      <div class="flex items-baseline gap-1 text-tertiary">
        <span class="text-[3rem] leading-none font-display font-light">12</span>
        <span class="text-sm font-body">days</span>
      </div>
      <div class="flex gap-1 mt-3">
        {#each [1, 2, 3, 4, 5] as day, i}
          <div class="w-2 h-2 rounded-full {i < 4 ? 'bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.5)]' : 'bg-surface-variant'}"></div>
        {/each}
      </div>
    </Card>

    <Card level={1} padding="default" class="flex flex-col items-center justify-center text-center !rounded-3xl border border-white/5 relative overflow-hidden">
      <span class="text-on-surface-variant font-body text-sm mb-2 z-10">Weekly Goal</span>
      <div class="z-10 mt-1">
        <ProgressRing progress={mounted ? 75 : 0} size={80} strokeWidth={6} color="var(--color-primary)" trackColor="var(--color-surface-container-highest)">
          <div class="flex flex-col items-center">
            <span class="text-xl font-display font-medium text-on-surface">7.5</span>
            <span class="text-[10px] text-on-surface-variant uppercase tracking-wider">/ 10h</span>
          </div>
        </ProgressRing>
      </div>
    </Card>
  </div>

  <!-- Weekly Bar Chart -->
  <Card level={1} padding="default" class="border border-white/5 !rounded-3xl">
    <div class="flex justify-between items-end mb-6">
      <span class="text-on-surface font-display font-medium text-lg">This Week</span>
      <span class="text-primary font-body text-sm">8h 15m total</span>
    </div>
    
    <div class="h-40 flex items-end justify-between gap-2 relative">
      <!-- Grid lines -->
      <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
        <div class="border-b border-white/5 w-full"></div>
        <div class="border-b border-white/5 w-full"></div>
        <div class="border-b border-white/5 w-full"></div>
      </div>

      {#each weeklyData as day, i}
        <div class="flex flex-col items-center flex-1 z-10 group">
          <!-- Tooltip simulation -->
          <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-surface-container-highest text-xs text-on-surface px-2 py-1 rounded-lg">
            {day.minutes}m
          </div>
          <!-- Bar -->
          <div 
            class="w-full max-w-[2rem] rounded-t-lg transition-all duration-1000 ease-out {day.minutes === maxMinutes ? 'bg-primary shadow-[0_0_15px_rgba(192,193,255,0.3)]' : 'bg-surface-variant hover:bg-primary/50'}"
            style="height: {mounted ? (day.minutes / maxMinutes) * 100 : 0}%;"
          ></div>
          <span class="text-on-surface-variant text-xs mt-2 font-body font-medium">{day.day}</span>
        </div>
      {/each}
    </div>
  </Card>

  <!-- Monthly Stats -->
  <div class="grid grid-cols-2 gap-4">
    <StatCard title="Monthly Hours" value="42" subtitle="Top 10% of users" />
    <StatCard title="Sessions" value="28" subtitle="Avg 1.4 per day" />
  </div>

  <!-- Instrument Split -->
  <Card level={2} padding="default" class="border border-white/5 glass-shadow !rounded-3xl">
    <span class="text-on-surface font-display font-medium text-lg block mb-4">Instrument Split</span>
    
    <div class="space-y-4">
      <div>
        <div class="flex justify-between text-sm font-body mb-1">
          <span class="text-on-surface">Piano</span>
          <span class="text-tertiary font-medium">65%</span>
        </div>
        <div class="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div class="h-full bg-tertiary rounded-full transition-all duration-1000 ease-out" style="width: {mounted ? 65 : 0}%"></div>
        </div>
      </div>
      <div>
        <div class="flex justify-between text-sm font-body mb-1">
          <span class="text-on-surface">Clarinet</span>
          <span class="text-primary font-medium">35%</span>
        </div>
        <div class="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div class="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style="width: {mounted ? 35 : 0}%"></div>
        </div>
      </div>
    </div>
  </Card>

  <!-- Activity Calendar (GitHub style contribution map) -->
  <Card level={1} padding="default" class="border border-white/5 !rounded-3xl">
    <span class="text-on-surface font-display font-medium text-lg block mb-4">Activity</span>
    <div class="grid grid-cols-7 gap-1.5">
      {#each activityMap as activity}
        <div class="aspect-square rounded-md transition-colors {
          activity === 0 ? 'bg-surface-container-highest' :
          activity === 1 ? 'bg-primary/30' :
          activity === 2 ? 'bg-primary/70' :
          'bg-primary shadow-[0_0_10px_rgba(192,193,255,0.4)]'
        }"></div>
      {/each}
    </div>
    <div class="flex justify-between items-center mt-3 text-xs text-on-surface-variant font-body">
      <span>Last 35 days</span>
      <div class="flex items-center gap-1">
        <span>Less</span>
        <div class="flex gap-0.5">
          <div class="w-2 h-2 rounded bg-surface-container-highest"></div>
          <div class="w-2 h-2 rounded bg-primary/30"></div>
          <div class="w-2 h-2 rounded bg-primary/70"></div>
          <div class="w-2 h-2 rounded bg-primary"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  </Card>

  <!-- Recent Sessions List -->
  <div>
    <SectionHeader title="Recent Sessions" />
    <div class="space-y-3 mt-4">
      {#each recentSessions as session}
        <Card level={1} padding="default" class="flex items-center justify-between !py-3 hover:bg-surface-container transition-colors border border-transparent hover:border-white/5 cursor-pointer">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
              {#if session.instrument === 'Piano'}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
              {/if}
            </div>
            <div>
              <div class="text-on-surface font-display font-medium text-sm">{session.instrument} • {session.type}</div>
              <div class="text-on-surface-variant font-body text-xs">{session.date}</div>
            </div>
          </div>
          <div class="text-tertiary font-display font-medium">
            {session.duration}
          </div>
        </Card>
      {/each}
    </div>
  </div>
</div>
