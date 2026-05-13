<script lang="ts">
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/Button.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { TunerEngine } from '$lib/features/TunerEngine';
  import { authStore } from '$lib/stores/auth.svelte';
  import { dbService } from '$lib/services/dbService';
  import { i18n } from '$lib/i18n.svelte';

  const engine = new TunerEngine();
  
  let isListening = $state(false);
  let isReferencePlaying = $state(false);
  let tuningFreq = $state(440);
  
  let currentFreq = $state<number | null>(null);
  let currentNote = $state<string>('-');
  let currentCents = $state<number>(0);
  let hasSignal = $state(false);

  // For logging
  let startTime: number | null = null;
  let detectedNotes: Set<string> = new Set();
  let totalCents = 0;
  let detections = 0;

  // Instruments mapping (semitones to transpose to display the WRITTEN note for the player)
  const instruments = $derived([
    { label: i18n.t('tuner.instruments.chromatic'), transpose: 0 },
    { label: i18n.t('tuner.instruments.clarinet'), transpose: 2 },
    { label: i18n.t('tuner.instruments.piano'), transpose: 0 }
  ]);
  let selectedInstrument = $state(instruments[0]);

  const noteStrings = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

  function getNoteData(freq: number, transpose: number) {
    const noteNum = Math.round(12 * (Math.log2(freq / tuningFreq)) + 69);
    // Target freq of the closest concert note
    const targetFreq = tuningFreq * Math.pow(2, (noteNum - 69) / 12);
    const cents = Math.floor(1200 * Math.log2(freq / targetFreq));
    
    // Transpose for display
    const displayNoteNum = noteNum + transpose;
    // ensure positive index
    const noteIndex = ((displayNoteNum % 12) + 12) % 12;
    const noteName = noteStrings[noteIndex];
    
    return { noteName, cents };
  }

  onMount(async () => {
    if (authStore.user) {
      const settings = await dbService.getSettings(authStore.user.id);
      if (settings.data?.tuning_freq) {
        tuningFreq = settings.data.tuning_freq;
      }
    }

    engine.onPitchDetected = (pitch, rms) => {
      if (pitch) {
        hasSignal = true;
        currentFreq = pitch;
        const data = getNoteData(pitch, selectedInstrument.transpose);
        currentNote = data.noteName;
        currentCents = data.cents;

        // Logging data
        detectedNotes.add(data.noteName);
        totalCents += Math.abs(data.cents);
        detections++;
      } else {
        hasSignal = false;
      }
    };
  });

  async function logTunerUsage() {
    if (!startTime || !authStore.user) return;
    const durationSeconds = (Date.now() - startTime) / 1000;
    if (durationSeconds < 2) return;

    await dbService.logTuner(authStore.user.id, {
      notes_detected: Array.from(detectedNotes),
      average_accuracy: detections > 0 ? totalCents / detections : 0,
      duration_seconds: Math.round(durationSeconds)
    });
    
    startTime = null;
    detectedNotes.clear();
    totalCents = 0;
    detections = 0;
  }

  async function toggleListening() {
    if (isListening) {
      engine.stopListening();
      isListening = false;
      hasSignal = false;
      logTunerUsage();
    } else {
      await engine.startListening();
      startTime = Date.now();
      isListening = true;
    }
  }

  function toggleReferenceTone() {
    if (isReferencePlaying) {
      engine.stopReferenceTone();
      isReferencePlaying = false;
    } else {
      engine.playReferenceTone(tuningFreq);
      isReferencePlaying = true;
    }
  }

  onDestroy(() => {
    engine.stopListening();
    engine.stopReferenceTone();
    if (isListening) logTunerUsage();
  });

  // Calculate tuning color
  // Green (< 5 cents), Yellow (< 15 cents), Red (> 15 cents)
  let statusColor = $derived(
    !hasSignal ? 'bg-surface-container-highest' :
    Math.abs(currentCents) <= 5 ? 'bg-tertiary shadow-[0_0_20px_rgba(78,222,163,0.5)]' :
    Math.abs(currentCents) <= 15 ? 'bg-primary shadow-[0_0_15px_rgba(192,193,255,0.4)]' :
    'bg-[#ffb4ab] shadow-[0_0_15px_rgba(255,180,171,0.4)]' // Error color from spec
  );
  
  let textColor = $derived(
    !hasSignal ? 'text-on-surface-variant' :
    Math.abs(currentCents) <= 5 ? 'text-tertiary drop-shadow-[0_0_15px_rgba(78,222,163,0.5)]' :
    Math.abs(currentCents) <= 15 ? 'text-primary' :
    'text-[#ffb4ab]'
  );

  // Meter position (clamp to -50 and +50 cents for UI)
  let meterPosition = $derived(
    hasSignal ? Math.max(-50, Math.min(50, currentCents)) : 0
  );
</script>

<div class="p-4 pt-12 space-y-6 animate-fade-in pb-28 flex flex-col h-full min-h-screen">
  <SectionHeader title={i18n.t('tuner.title')} subtitle={i18n.t('tuner.subtitle')} />
  
  <!-- Top Bar: Instrument & Reference -->
  <div class="flex gap-4 z-10">
    <div class="relative flex-1 group">
      <select bind:value={selectedInstrument} class="w-full appearance-none bg-surface-container text-on-surface text-sm py-4 pl-4 pr-10 rounded-2xl outline-none border border-white/5 cursor-pointer font-body shadow-sm">
        {#each instruments as inst}
          <option value={inst}>{inst.label}</option>
        {/each}
      </select>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </div>

    <button 
      onclick={toggleReferenceTone}
      class="flex flex-col items-center justify-center px-4 rounded-2xl transition-all duration-300 border border-white/5 {isReferencePlaying ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'}"
    >
      <span class="text-[10px] font-medium tracking-wider uppercase mb-0.5">{i18n.t('tuner.ref_tone')}</span>
      <span class="text-sm font-display font-bold">A440</span>
    </button>
  </div>

  <!-- Main Tuning Display -->
  <Card level={2} padding="lg" class="flex-1 flex flex-col items-center justify-center relative min-h-[360px] border border-white/5 glass-shadow">
    
    <!-- Listening State -->
    {#if isListening && !hasSignal}
      <div class="absolute top-6 flex items-center gap-2" transition:fade>
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
        <span class="text-sm text-on-surface-variant font-body animate-pulse">{i18n.t('tuner.listening')}</span>
      </div>
    {/if}

    <!-- Freq Display -->
    <div class="absolute top-8 w-full text-center">
      <span class="text-on-surface-variant font-body text-sm tracking-widest uppercase">Freq</span>
      <div class="text-xl font-display font-light text-on-surface">
        {hasSignal && currentFreq ? currentFreq.toFixed(1) : '---'} Hz
      </div>
    </div>

    <!-- Note Display -->
    <div class="flex flex-col items-center justify-center mt-8">
      <span class="text-[8rem] leading-none font-display font-light transition-colors duration-300 {textColor}">
        {currentNote}
      </span>
      <span class="text-xl font-body font-medium transition-colors duration-300 {textColor} mt-2">
        {#if !hasSignal}
          --
        {:else if currentCents > 0}
          +{currentCents} {i18n.t('tuner.cents')}
        {:else}
          {currentCents} {i18n.t('tuner.cents')}
        {/if}
      </span>
    </div>

    <!-- Tuning Meter Bar -->
    <div class="absolute bottom-12 left-8 right-8">
      <div class="relative h-2 bg-surface-container-lowest rounded-full overflow-hidden mb-2">
        <!-- Target Center Line -->
        <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-surface-variant -translate-x-1/2 z-10"></div>
        
        <!-- The Needle -->
        <div 
          class="absolute top-0 bottom-0 w-3 rounded-full -translate-x-1/2 transition-all duration-150 ease-out {statusColor}"
          style="left: {50 + meterPosition}%"
        ></div>
      </div>
      
      <!-- Labels -->
      <div class="flex justify-between text-[10px] uppercase tracking-widest text-on-surface-variant font-body">
        <span>{i18n.t('tuner.flat')}</span>
        <span class="text-tertiary opacity-70">{i18n.t('tuner.perfect')}</span>
        <span>{i18n.t('tuner.sharp')}</span>
      </div>
    </div>
  </Card>

  <!-- Start/Stop Listening -->
  <div class="px-2 mt-auto">
    <Button 
      onclick={toggleListening}
      class="w-full text-lg shadow-[0_8px_32px_rgba(192,193,255,0.15)] transition-all duration-300 {isListening ? 'bg-surface-container-highest text-primary hover:bg-surface-variant border border-primary/20' : ''}"
    >
      {#if isListening}
        {i18n.t('common.stop')} {i18n.t('tuner.title')}
      {:else}
        {i18n.t('common.start')} {i18n.t('tuner.title')}
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
</style>
