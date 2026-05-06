import { authService } from '$lib/services/authService';
import type { Session, User } from '@supabase/supabase-js';

class AuthStore {
  session = $state<Session | null>(null);
  user = $state<User | null>(null);
  loading = $state(true);

  constructor() {
    this.init();
  }

  async init() {
    try {
      const { session, error } = await authService.getSession();
      if (error) throw error;
      this.session = session;
      this.user = session?.user ?? null;
    } catch (e) {
      console.error('Auth init error:', e);
      this.session = null;
      this.user = null;
    } finally {
      this.loading = false;
    }

    authService.onAuthStateChange((session) => {
      this.session = session;
      this.user = session?.user ?? null;
      this.loading = false;
    });
  }

  get isAuthenticated() {
    return !!this.user;
  }
}

export const authStore = new AuthStore();
