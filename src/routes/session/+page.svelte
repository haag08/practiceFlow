<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { dbService } from '$lib/services/dbService';
  import { i18n } from '$lib/i18n.svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { page } from '$app/state';

  let sessionId = $state<string | null>(null);
  let startTime = $state<number>(Date.now());
  let elapsedSeconds = $state(0);
  let timerInterval: any;

  let blocks = $state<any[]>([]);
  let currentBlockType = $state(page.url.searchParams.get('type') || 'warmup');
  let currentBlockStart = $state(Date.now());
  let isTypePreselected = $state(!!page.url.searchParams.get('type'));

  let quotes = $derived(i18n.t('session.quotes') as string[]);
  let currentQuoteIndex = $state(0);
  let currentQuote = $derived(quotes[currentQuoteIndex]);
  let quoteInterval: any;

  // New session states
  let sessionState = $state<'mode_selection' | 'timer_setup' | 'active'>('mode_selection');
  let sessionMode = $state<'stopwatch' | 'timer'>('stopwatch');
  let targetSeconds = $state(0);
  let timerElapsed = $state(0);
  let timerInput = $state(15);
  let showCongrats = $state(false);

  onMount(async () => {
    if (!authStore.user) {
      goto(base + '/login');
      return;
    }
  });

  async function startSession() {
    if (!authStore.user) return;
    
    // Start session in DB
    const { data, error } = await dbService.startSession(authStore.user.id);
    if (data) {
      sessionId = data.id;
    }

    startTime = Date.now();
    currentBlockStart = Date.now();
    sessionState = 'active';

    timerInterval = setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      
      if (sessionMode === 'timer' && timerElapsed < targetSeconds) {
        timerElapsed++;
        if (timerElapsed >= targetSeconds) {
          showCongrats = true;
          // We don't reset targetSeconds here because we want to keep showing the Congrats state
        }
      }
    }, 1000);

    // Motivational quotes rotation (every 30 seconds)
    quoteInterval = setInterval(() => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    }, 30000);
  }

  function handleModeSelect(mode: 'stopwatch' | 'timer') {
    sessionMode = mode;
    if (mode === 'timer') {
      sessionState = 'timer_setup';
    } else {
      startSession();
    }
  }

  function handleTimerConfirm() {
    targetSeconds = timerInput * 60;
    timerElapsed = 0;
    startSession();
  }

  function formatTime(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  async function addBlock() {
    if (!sessionId) return;
    const duration = Math.floor((Date.now() - currentBlockStart) / 60000);
    if (duration > 0) {
      const block = {
        type: currentBlockType,
        duration_minutes: duration,
        notes: ''
      };
      blocks = [...blocks, block];
      await dbService.addSessionBlock(sessionId, block);
    }
    currentBlockStart = Date.now();
  }

  async function finishSession() {
    if (!sessionId) return;
    
    // Add final block
    await addBlock();

    const totalDuration = Math.round((Date.now() - startTime) / 60000);
    await dbService.finishSession(sessionId, totalDuration);
    
    // Update daily stats
    if (authStore.user) {
      await dbService.updateDailyStats(authStore.user.id, totalDuration);
    }

    goto(base + '/');
  }

  function startTimer() {
    targetSeconds = timerInput * 60;
    timerElapsed = 0;
    showTimerSetup = false;
    showCongrats = false;
  }

  onDestroy(() => {
    clearInterval(timerInterval);
    clearInterval(quoteInterval);
  });
</script>

<div class="p-6 pt-16 flex flex-col items-center justify-center min-h-screen bg-surface text-on-surface">
  <div class="w-full max-w-md space-y-8 animate-fade-in">
    {#if sessionState === 'mode_selection'}
      <div class="text-center space-y-6">
        <h1 class="text-3xl font-display font-bold text-on-surface">{i18n.t('session.choose_mode')}</h1>
        <div class="grid grid-cols-1 gap-4">
          <button 
            onclick={() => handleModeSelect('stopwatch')}
            class="group p-8 rounded-3xl bg-surface-container hover:bg-primary/10 border border-white/5 transition-all text-left flex items-center justify-between"
          >
            <div class="space-y-1">
              <h3 class="text-xl font-display font-bold text-on-surface group-hover:text-primary transition-colors">{i18n.t('session.stopwatch')}</h3>
              <p class="text-sm text-on-surface-variant opacity-70">Count up your practice time.</p>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-highest group-hover:bg-primary group-hover:text-on-primary transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </button>

          <button 
            onclick={() => handleModeSelect('timer')}
            class="group p-8 rounded-3xl bg-surface-container hover:bg-tertiary/10 border border-white/5 transition-all text-left flex items-center justify-between"
          >
            <div class="space-y-1">
              <h3 class="text-xl font-display font-bold text-on-surface group-hover:text-tertiary transition-colors">{i18n.t('session.timer')}</h3>
              <p class="text-sm text-on-surface-variant opacity-70">Set a fixed goal duration.</p>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-highest group-hover:bg-tertiary group-hover:text-[#060e20] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    {:else if sessionState === 'timer_setup'}
      <div class="text-center space-y-8">
        <div class="space-y-2">
          <h1 class="text-3xl font-display font-bold text-on-surface">{i18n.t('session.set_timer')}</h1>
          <p class="text-on-surface-variant opacity-70">How long do you want to practice?</p>
        </div>

        <Card level={2} padding="lg" class="!rounded-[2.5rem] glass-shadow border border-white/5 space-y-8">
          <div class="space-y-6">
            <div class="text-center">
              <span class="text-6xl font-display font-bold text-primary">{timerInput}</span>
              <span class="text-xl font-display text-on-surface-variant ml-2">{i18n.t('session.minutes')}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="120" 
              bind:value={timerInput}
              class="w-full accent-primary h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <Button onclick={handleTimerConfirm} class="w-full h-16 text-lg !rounded-2xl">{i18n.t('common.start')}</Button>
        </Card>
        
        <button 
          onclick={() => sessionState = 'mode_selection'}
          class="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
        >
          {i18n.t('common.back')}
        </button>
      </div>
    {:else if sessionState === 'active'}
      <div class="text-center space-y-4">
        <div class="space-y-2">
          <span class="text-primary font-body text-sm font-bold uppercase tracking-[0.3em]">{i18n.t('session.active_session')}</span>
          {#if sessionMode === 'stopwatch'}
            <h1 class="text-6xl font-display font-light tracking-tighter">{formatTime(elapsedSeconds)}</h1>
          {:else}
            <h1 class="text-6xl font-display font-light tracking-tighter text-tertiary">
              {formatTime(Math.max(0, targetSeconds - timerElapsed))}
            </h1>
          {/if}
        </div>
        
        {#if currentQuote}
          <div class="h-12 flex items-center justify-center px-4" transition:fade>
            <p class="text-on-surface-variant font-body italic text-sm text-center max-w-xs opacity-70">
              "{currentQuote}"
            </p>
          </div>
        {/if}
      </div>

      <Card level={2} padding="lg" class="!rounded-[2.5rem] glass-shadow border border-white/5 space-y-6">
        {#if !isTypePreselected}
          <div class="space-y-4">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">{i18n.t('session.current_focus')}</label>
            <div class="grid grid-cols-2 gap-3">
              {#each ['warmup', 'technique', 'repertoire', 'ensemble'] as type}
                <button 
                  onclick={() => { addBlock(); currentBlockType = type; }}
                  class="py-3 rounded-2xl text-sm font-display transition-all {currentBlockType === type ? 'bg-primary text-on-primary shadow-lg scale-[1.02]' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'}"
                >
                  {i18n.t('session.' + type)}
                </button>
              {/each}
            </div>
          </div>
        {:else}
          <div class="flex items-center justify-center py-2">
            <div class="px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-display font-bold text-sm uppercase tracking-widest">
              {i18n.t('session.' + currentBlockType)}
            </div>
          </div>
        {/if}

        {#if showCongrats}
          <div class="p-6 rounded-2xl bg-tertiary/10 border border-tertiary/30 text-center space-y-2 animate-bounce-in" transition:fade>
            <h3 class="text-xl font-display font-bold text-tertiary">{i18n.t('session.congrats')}</h3>
            <p class="text-sm text-on-surface-variant">{i18n.t('session.congrats_msg')}</p>
            <Button variant="secondary" onclick={() => showCongrats = false} class="!h-10 !rounded-xl !text-xs !bg-tertiary/20">{i18n.t('common.done')}</Button>
          </div>
        {/if}

        {#if blocks.length > 0}
          <div class="space-y-3 pt-4 border-t border-white/5">
            <h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">{i18n.t('session.completed_blocks')}</h4>
            <div class="space-y-2">
              {#each blocks as block}
                <div class="flex justify-between items-center p-3 bg-surface-container-lowest rounded-xl border border-white/5">
                  <span class="text-sm font-body">{i18n.t('session.' + block.type)}</span>
                  <span class="text-sm font-display text-primary">{block.duration_minutes} {i18n.t('common.min')}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </Card>

      <div class="pt-4">
        <Button 
          onclick={finishSession}
          class="w-full h-16 text-lg !rounded-2xl bg-gradient-to-br from-tertiary to-[#00a472] text-[#060e20] shadow-[0_8px_32px_rgba(78,222,163,0.25)] flex items-center justify-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
          </svg>
          {i18n.t('session.finish_session')}
        </Button>
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in {
    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
