<script lang="ts">
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { MetronomeEngine } from '$lib/features/MetronomeEngine';
  import { authStore } from '$lib/stores/auth.svelte';
  import { dbService } from '$lib/services/dbService';

  let bpm = $state(120);
  let isPlaying = $state(false);
  let timeSignature = $state(4); // 4/4 default
  let currentBeat = $state(1);
  let beatPulse = $state(false);
  
  // Audio settings
  let soundType = $state<'classic' | 'woodblock' | 'digital'>('classic');
  let volume = $state(80); // 0-100
  let isMuted = $state(false);

  let tapTimes: number[] = [];
  let startTime: number | null = null;
  
  const engine = new MetronomeEngine();

  // Options
  const signatures = [
    { label: '3/4', value: 3 },
    { label: '4/4', value: 4 },
    { label: '6/8', value: 6 }
  ];
  const soundTypes = [
    { label: 'Classic', value: 'classic' },
    { label: 'Woodblock', value: 'woodblock' },
    { label: 'Digital', value: 'digital' }
  ];

  onMount(async () => {
    if (authStore.user) {
      const settings = await dbService.getSettings(authStore.user.id);
      if (settings.data?.default_bpm) {
        bpm = settings.data.default_bpm;
      }
    }

    engine.onBeat = (beat) => {
      currentBeat = beat;
      triggerBeat();
    };
    // Initialize engine values
    updateEngine();
  });

  function updateEngine() {
    engine.bpm = bpm;
    engine.timeSignature = timeSignature;
    engine.soundType = soundType;
    engine.volume = volume / 100;
    engine.isMuted = isMuted;
  }

  // Update engine whenever states change
  $effect(() => {
    bpm; timeSignature; soundType; volume; isMuted; // Track dependencies
    updateEngine();
  });

  async function logMetronomeUsage() {
    if (!startTime || !authStore.user) return;
    const durationSeconds = (Date.now() - startTime) / 1000;
    if (durationSeconds < 2) return; // Don't log very short usage

    await dbService.logMetronome(authStore.user.id, {
      bpm,
      duration_seconds: Math.round(durationSeconds)
    });
    startTime = null;
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      startTime = Date.now();
      engine.start();
    } else {
      engine.stop();
      beatPulse = false;
      logMetronomeUsage();
    }
  }

  function triggerBeat() {
    beatPulse = true;
    setTimeout(() => {
      beatPulse = false;
    }, 100);
  }

  function handleTap() {
    const now = Date.now();
    tapTimes.push(now);
    
    if (tapTimes.length > 4) tapTimes.shift();

    if (tapTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimes.length; i++) {
        intervals.push(tapTimes[i] - tapTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      
      if (calculatedBpm >= 40 && calculatedBpm <= 220) {
        bpm = calculatedBpm;
      }
    }
  }

  function adjustBpm(delta: number) {
    bpm = Math.max(40, Math.min(220, bpm + delta));
  }

  onDestroy(() => {
    engine.stop();
    if (isPlaying) logMetronomeUsage();
  });
</script>

<div class="p-4 pt-12 space-y-8 animate-fade-in pb-28 flex flex-col h-full min-h-screen">
  <SectionHeader title="Metronome" subtitle="Find your rhythm" />
  
  <!-- 1. Grosser BPM Kreis -->
  <div class="flex-1 flex flex-col items-center justify-center py-6 relative">
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div 
        class="w-64 h-64 rounded-full transition-all duration-100 ease-out {beatPulse ? (currentBeat === 1 ? 'bg-tertiary/20 scale-125 blur-3xl' : 'bg-primary/20 scale-110 blur-2xl') : 'bg-transparent scale-100 blur-none'}"
      ></div>
    </div>

    <Card level={2} padding="lg" class="relative w-64 h-64 rounded-full flex flex-col items-center justify-center border border-white/5 glass-shadow overflow-visible">
      <svg class="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 256 256">
        <circle cx="128" cy="128" r="126" stroke="currentColor" stroke-width="2" fill="none" class="text-surface-container-highest" />
        <circle 
          cx="128" cy="128" r="126" 
          stroke="currentColor" 
          stroke-width="4" 
          fill="none" 
          stroke-dasharray="791" 
          stroke-dashoffset={791 - (791 * ((bpm - 40) / 180))}
          class="text-primary transition-all duration-300 ease-out" 
          stroke-linecap="round"
        />
      </svg>

      <span class="text-on-surface-variant font-body text-sm font-medium tracking-widest uppercase mb-1">BPM</span>
      <span class="text-[5rem] leading-none font-display font-light text-on-surface tracking-tighter transition-all {beatPulse ? (currentBeat === 1 ? 'text-tertiary scale-105 drop-shadow-[0_0_15px_rgba(78,222,163,0.5)]' : 'text-primary scale-[1.02]') : ''}">
        {bpm}
      </span>
      <span class="text-on-surface-variant/70 font-body text-sm mt-2">{bpm < 60 ? 'Largo' : bpm < 108 ? 'Andante' : bpm < 120 ? 'Moderato' : bpm < 168 ? 'Allegro' : 'Presto'}</span>
    </Card>

    <div class="flex items-center gap-3 mt-10">
      {#each Array(timeSignature) as _, i}
        <div 
          class="w-3 h-3 rounded-full transition-all duration-200 {i === 0 ? 'w-4 h-4' : ''} {currentBeat === i + 1 && isPlaying ? (i === 0 ? 'bg-tertiary shadow-[0_0_12px_rgba(78,222,163,0.8)] scale-125' : 'bg-primary shadow-[0_0_10px_rgba(192,193,255,0.6)] scale-110') : 'bg-surface-container-highest'}"
        ></div>
      {/each}
    </div>
  </div>

  <!-- 2. Controls Panel -->
  <Card level={1} padding="default" class="space-y-6 !rounded-3xl glass-panel relative z-10 border border-white/5">
    
    <!-- Sound & Volume Settings (New) -->
    <div class="flex items-center gap-4 pb-4 border-b border-white/5">
      <button 
        onclick={() => isMuted = !isMuted} 
        class="w-10 h-10 rounded-full flex items-center justify-center transition-colors {isMuted ? 'bg-surface-container-lowest text-on-surface-variant' : 'bg-primary/20 text-primary'}"
      >
        {#if isMuted}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
        {/if}
      </button>

      <div class="flex-1">
        <input 
          type="range" 
          min="0" 
          max="100" 
          bind:value={volume}
          class="w-full accent-primary h-1 bg-surface-container-lowest rounded-full appearance-none outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div class="relative group">
        <select bind:value={soundType} class="appearance-none bg-surface-container-lowest text-on-surface text-sm py-2 pl-3 pr-8 rounded-xl outline-none border border-white/5 cursor-pointer font-body">
          {#each soundTypes as type}
            <option value={type.value}>{type.label}</option>
          {/each}
        </select>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- BPM Slider -->
    <div class="flex items-center justify-between gap-4">
      <button onclick={() => adjustBpm(-1)} class="w-12 h-12 shrink-0 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center hover:bg-surface-container-highest transition-colors ghost-border active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" /></svg>
      </button>
      
      <div class="flex-1 px-2">
        <input 
          type="range" 
          min="40" 
          max="220" 
          bind:value={bpm}
          class="w-full accent-primary h-2 bg-surface-container-lowest rounded-full appearance-none outline-none focus:ring-2 focus:ring-primary/20 custom-slider"
        />
      </div>

      <button onclick={() => adjustBpm(1)} class="w-12 h-12 shrink-0 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center hover:bg-surface-container-highest transition-colors ghost-border active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
      </button>
    </div>

    <!-- Time Signature & Tap Tempo -->
    <div class="flex gap-4 pt-2 border-t border-white/5">
      <div class="flex-1 grid grid-cols-3 gap-2">
        {#each signatures as sig}
          <button 
            onclick={() => timeSignature = sig.value}
            class="py-2 rounded-xl text-sm font-display transition-colors {timeSignature === sig.value ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}"
          >
            {sig.label}
          </button>
        {/each}
      </div>
      <button 
        onclick={handleTap}
        class="flex-1 py-2 rounded-xl bg-surface-container-highest text-primary font-display font-medium ghost-border active:scale-95 transition-transform"
      >
        TAP TEMPO
      </button>
    </div>
  </Card>

  <!-- 4. Start / Stop Button -->
  <div class="px-4">
    <Button 
      onclick={togglePlay}
      class="w-full text-xl h-16 shadow-[0_8px_32px_rgba(192,193,255,0.15)] flex items-center justify-center gap-3 transition-all duration-300 {isPlaying ? 'bg-gradient-to-br from-tertiary to-[#00a472] text-[#060e20] shadow-[0_0_40px_rgba(78,222,163,0.3)]' : ''}"
    >
      {#if isPlaying}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
          <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
        </svg>
        Pause
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 ml-1">
          <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
        </svg>
        Start
      {/if}
    </Button>
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
  
  .custom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
    box-shadow: 0 0 15px rgba(192, 193, 255, 0.4);
    border: 3px solid var(--color-surface-container-highest);
  }
  
  .custom-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
    box-shadow: 0 0 15px rgba(192, 193, 255, 0.4);
    border: 3px solid var(--color-surface-container-highest);
  }

  /* Thin slider for volume */
  input[type=range]:not(.custom-slider)::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
  }
</style>
