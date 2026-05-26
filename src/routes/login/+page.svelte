<script lang="ts">
  import { authService } from '$lib/services/authService';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { i18n } from '$lib/i18n.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';

  // Initialize default language from settingsStore or browser if needed
  let selectedLanguage = $state(settingsStore.settings.language || 'en');

  function handleLanguageChange(e: Event) {
    const lang = (e.target as HTMLSelectElement).value;
    selectedLanguage = lang;
    settingsStore.settings.language = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pending_lang', lang);
    }
  }

  let mode = $state<'login' | 'signup'>('login');
  let email = $state('');
  let password = $state('');
  let username = $state('');
  let fullName = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function handleSubmit() {
    loading = true;
    error = null;

    try {
      if (mode === 'signup') {
        const redirectTo = window.location.origin + base;
        const { error: signUpError } = await authService.signUp(email, password, username, fullName, selectedLanguage, redirectTo);
        if (signUpError) throw signUpError;
        alert(i18n.t('auth.confirm_email'));
        mode = 'login';
      } else {
        const { error: signInError } = await authService.signIn(email, password);
        if (signInError) throw signInError;
        goto(base + '/');
      }
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-6 bg-surface overflow-hidden relative">
  <!-- Background Decorative Elements -->
  <div class="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
  <div class="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-tertiary/5 blur-[120px] rounded-full"></div>

  <!-- Language Selector -->
  <div class="absolute top-6 right-6 z-20">
    <select 
      value={selectedLanguage} 
      onchange={handleLanguageChange}
      class="bg-surface-container-lowest border border-white/5 rounded-xl py-2 px-3 text-sm font-display text-on-surface-variant focus:outline-none focus:border-primary/50 cursor-pointer hover:bg-surface-container-highest transition-colors shadow-lg"
    >
      <option value="en">English</option>
      <option value="de">Deutsch</option>
    </select>
  </div>

  <div class="w-full max-w-md z-10 animate-fade-in">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-display font-bold text-on-surface tracking-tighter mb-2">
        Practice<span class="gradient-text">Flow</span>
      </h1>
      <p class="text-on-surface-variant font-body tracking-wide opacity-70">
        {mode === 'login' ? i18n.t('auth.welcome_back') : i18n.t('auth.start_journey')}
      </p>
    </div>

    <Card level={2} padding="lg" class="glass-shadow border border-white/5 !rounded-[2.5rem]">
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-5">
        {#if mode === 'signup'}
          <div class="space-y-2">
            <label for="fullName" class="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">{i18n.t('auth.full_name')}</label>
            <input 
              id="fullName"
              type="text" 
              bind:value={fullName}
              placeholder="e.g. Max Mustermann"
              class="w-full h-14 bg-surface-container-highest border border-white/5 rounded-2xl px-5 font-body text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              required
            />
          </div>
          <div class="space-y-2">
            <label for="username" class="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">{i18n.t('auth.username')}</label>
            <input 
              id="username"
              type="text" 
              bind:value={username}
              placeholder="max_musi"
              class="w-full h-14 bg-surface-container-highest border border-white/5 rounded-2xl px-5 font-body text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              required
            />
          </div>
        {/if}

        <div class="space-y-2">
          <label for="email" class="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">{i18n.t('auth.email')}</label>
          <input 
            id="email"
            type="email" 
            bind:value={email}
            placeholder="your@email.com"
            class="w-full h-14 bg-surface-container-highest border border-white/5 rounded-2xl px-5 font-body text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
            required
          />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">{i18n.t('auth.password')}</label>
          <input 
            id="password"
            type="password" 
            bind:value={password}
            placeholder="••••••••"
            class="w-full h-14 bg-surface-container-highest border border-white/5 rounded-2xl px-5 font-body text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
            required
          />
        </div>

        {#if error}
          <div class="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-body animate-shake">
            {error}
          </div>
        {/if}

        <Button 
          type="submit" 
          class="w-full h-14 !rounded-2xl mt-4 relative overflow-hidden group shadow-lg"
          disabled={loading}
        >
          {#if loading}
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{i18n.t('auth.processing')}</span>
            </div>
          {:else}
            <span>{mode === 'login' ? i18n.t('auth.sign_in') : i18n.t('auth.create_account')}</span>
          {/if}
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </Button>
      </form>

      <div class="mt-8 text-center">
        <button 
          onclick={() => mode = mode === 'login' ? 'signup' : 'login'}
          class="text-sm text-on-surface-variant hover:text-primary transition-colors font-body"
        >
          {mode === 'login' ? i18n.t('auth.no_account') : i18n.t('auth.has_account')}
        </button>
      </div>
    </Card>
  </div>
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .animate-shake {
    animation: shake 0.3s ease-in-out;
  }
</style>
