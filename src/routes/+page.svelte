<script lang="ts">
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';
  import ProgressRing from '$lib/components/ProgressRing.svelte';
  
  const user = { name: 'Julian', streak: 14, timeToday: 0, goal: 45 };
  
  const practiceItems = [
    { title: 'Warmup', subtitle: 'Long tones & lip slurs', duration: '10 min', icon: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.866 8.21 8.21 0 003 2.48z' },
    { title: 'Technique', subtitle: 'C Major Scale (120 BPM)', duration: '15 min', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
    { title: 'Pieces', subtitle: 'Concerto No. 1 - Mvt 1', duration: '20 min', icon: 'M9 19.5v-15m0 0l-5.5 5.5M9 4.5l5.5 5.5M21 15v4.5a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5V15' }
  ];

  const quickAccess = [
    { name: 'Metronome', icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z', path: '/metronome' },
    { name: 'Tuner', icon: 'M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z', path: '/tuner' },
    { name: 'Timer', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', path: '#' }
  ];
</script>

<div class="p-4 pt-12 space-y-10 animate-fade-in pb-8">
  <!-- 1. Begrüßung & Streak -->
  <div class="flex items-start justify-between px-2">
    <div>
      <h1 class="text-3xl font-display font-bold text-on-surface tracking-tight mb-1">
        Good Evening, <span class="gradient-text">{user.name}</span>.
      </h1>
      <p class="text-on-surface-variant font-body">Ready for your Nocturnal Session?</p>
    </div>
    
    <div class="flex flex-col items-center bg-surface-container-high px-4 py-2 rounded-2xl glass-shadow">
      <span class="text-tertiary font-display font-bold text-xl">{user.streak}</span>
      <span class="text-[10px] text-on-surface-variant uppercase tracking-wider font-body">Day Streak</span>
    </div>
  </div>

  <!-- 3. Primary Start Button -->
  <div class="px-2">
    <Button class="w-full text-lg shadow-[0_8px_32px_rgba(192,193,255,0.15)] flex items-center gap-3 relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
      </svg>
      Start Practice Session
    </Button>
  </div>

  <!-- 2. & 4. Overview & Cards -->
  <div>
    <SectionHeader title="Today's Plan" subtitle="{user.goal} minutes total" />
    
    <div class="space-y-4 px-2">
      {#each practiceItems as item}
        <Card level={1} padding="default" class="flex flex-col relative group cursor-pointer hover:bg-surface-container-high transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-surface-container-highest text-primary flex items-center justify-center">
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
          <!-- Fake Progress indicator inside the card to look "finished" -->
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-highest">
            <div class="h-full w-0 bg-primary/30 rounded-r-full transition-all group-hover:w-1/4"></div>
          </div>
        </Card>
      {/each}
    </div>
  </div>

  <!-- 6. Quick Access -->
  <div>
    <SectionHeader title="Quick Access" />
    <div class="grid grid-cols-3 gap-3 px-2">
      {#each quickAccess as access}
        <a href={access.path} class="flex flex-col items-center justify-center gap-3 bg-surface-container-high p-4 rounded-3xl hover:bg-surface-container-highest transition-colors">
          <div class="w-10 h-10 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d={access.icon} />
              {#if access.name === 'Tuner'}
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              {/if}
            </svg>
          </div>
          <span class="font-body text-xs font-medium text-on-surface-variant">{access.name}</span>
        </a>
      {/each}
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

