import { dbService } from '$lib/services/dbService';
import { authStore } from './auth.svelte';

class SettingsStore {
  settings = $state<any>({
    dark_mode: true,
    notifications: true,
    default_bpm: 120,
    tuning_freq: 440.0,
    language: 'en'
  });
  loading = $state(true);

  constructor() {
    $effect.root(() => {
      $effect(() => {
        if (authStore.user) {
          this.loadSettings();
        }
      });
    });
  }

  async loadSettings() {
    if (!authStore.user) return;
    this.loading = true;
    const { data } = await dbService.getSettings(authStore.user.id);
    if (data) {
      this.settings = data;
      
      // Check if user selected a language on login page before authenticating
      if (typeof window !== 'undefined') {
        const pendingLang = localStorage.getItem('pending_lang');
        if (pendingLang && pendingLang !== data.language) {
          this.settings.language = pendingLang;
          await this.updateSetting('language', pendingLang);
        }
        if (pendingLang) {
          localStorage.removeItem('pending_lang');
        }
      }
    }
    this.loading = false;
  }

  async updateSetting(key: string, value: any) {
    if (!authStore.user) return;
    this.settings[key] = value;
    await dbService.updateSettings(authStore.user.id, { [key]: value });
  }
}

export const settingsStore = new SettingsStore();
