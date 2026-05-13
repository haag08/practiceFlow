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
