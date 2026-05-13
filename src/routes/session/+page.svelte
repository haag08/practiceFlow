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

  // Timer logic
  let targetSeconds = $state(0);
  let timerElapsed = $state(0);
  let showTimerSetup = $state(false);
  let showCongrats = $state(false);
  let timerInput = $state(15);

  onMount(async () => {
    if (!authStore.user) {
      goto(base + '/login');
      return;
    }

    // Start session in DB
    const { data, error } = await dbService.startSession(authStore.user.id);
    if (data) {
      sessionId = data.id;
    }

    timerInterval = setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      
      if (targetSeconds > 0 && timerElapsed < targetSeconds) {
        timerElapsed++;
        if (timerElapsed >= targetSeconds) {
          showCongrats = true;
          // Reset timer after showing congrats
          targetSeconds = 0;
          timerElapsed = 0;
        }
      }
    }, 1000);

    // Motivational quotes rotation (every 30 seconds)
    quoteInterval = setInterval(() => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    }, 30000);
  });

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
    <div class="text-center space-y-4">
      <div class="space-y-2 relative">
        <span class="text-primary font-body text-sm font-bold uppercase tracking-[0.3em]">{i18n.t('session.active_session')}</span>
        <h1 class="text-6xl font-display font-light tracking-tighter">{formatTime(elapsedSeconds)}</h1>
        
        {#if targetSeconds > 0}
          <div class="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col items-end animate-pulse">
            <span class="text-[0.6rem] font-bold text-tertiary uppercase tracking-widest">{i18n.t('session.remaining')}</span>
            <span class="text-xl font-display text-tertiary">{formatTime(targetSeconds - timerElapsed)}</span>
          </div>
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
        <div class="flex items-center justify-between py-2">
          <div class="px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-display font-bold text-sm uppercase tracking-widest">
            {i18n.t('session.' + currentBlockType)}
          </div>
          
          <button 
            onclick={() => showTimerSetup = !showTimerSetup}
            class="p-2 rounded-xl bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      {/if}

      {#if showTimerSetup}
        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-primary/20 animate-fade-in space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold text-on-surface uppercase tracking-wider">{i18n.t('session.set_timer')}</span>
            <span class="text-lg font-display text-primary">{timerInput} {i18n.t('session.minutes')}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="60" 
            bind:value={timerInput}
            class="w-full accent-primary"
          />
          <Button onclick={startTimer} class="w-full !h-10 !rounded-xl !text-sm">{i18n.t('common.start')}</Button>
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
