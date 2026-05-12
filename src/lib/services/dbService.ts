import { supabase } from '$lib/supabaseClient';

export const dbService = {
  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    return { data, error };
  },

  // Settings
  async getSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  async updateSettings(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId);
    return { data, error };
  },

  // Sessions
  async startSession(userId: string) {
    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: userId,
        start_time: new Date().toISOString()
      })
      .select()
      .single();
    return { data, error };
  },

  async finishSession(sessionId: string, durationMinutes: number) {
    const { data, error } = await supabase
      .from('practice_sessions')
      .update({
        end_time: new Date().toISOString(),
        total_duration: durationMinutes
      })
      .eq('id', sessionId)
      .select()
      .single();

    return { data, error };
  },

  async addSessionBlock(sessionId: string, block: { type: string, duration_minutes: number, notes?: string }) {
    const { data, error } = await supabase
      .from('session_blocks')
      .insert({
        session_id: sessionId,
        type: block.type,
        duration_minutes: block.duration_minutes,
        notes: block.notes
      });
    return { data, error };
  },

  // Performance Optimization: Daily Stats
  async updateDailyStats(userId: string, minutes: number) {
    const date = new Date().toISOString().split('T')[0];
    
    const { data: existing } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (existing) {
      return await supabase
        .from('daily_stats')
        .update({
          total_minutes: existing.total_minutes + minutes,
          sessions_count: existing.sessions_count + 1
        })
        .eq('id', existing.id);
    } else {
      return await supabase
        .from('daily_stats')
        .insert({
          user_id: userId,
          date,
          total_minutes: minutes,
          sessions_count: 1
        });
    }
  },

  // Stats fetching
  async getDailyStats(userId: string, limit = 7) {
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getRecentSessions(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*, session_blocks(*)')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Tool Logs
  async logMetronome(userId: string, data: { bpm: number, duration_seconds: number }) {
    return await supabase.from('metronome_logs').insert({
      user_id: userId,
      bpm: data.bpm,
      duration_seconds: data.duration_seconds
    });
  },

  async logTuner(userId: string, data: { notes_detected: string[], average_accuracy: number, duration_seconds: number }) {
    return await supabase.from('tuner_logs').insert({
      user_id: userId,
      notes_detected: data.notes_detected,
      average_accuracy: data.average_accuracy,
      duration_seconds: data.duration_seconds
    });
  },

  // Storage
  async uploadAvatar(path: string, file: File) {
    return await supabase.storage
      .from('avatars')
      .upload(path, file);
  },

  // Pieces Management
  async createFolder(userId: string, folderName: string) {
    // Simple implementation using a 'folders' table
    return await supabase.from('folders').insert({ user_id: userId, name: folderName });
  },

  async getFolders(userId: string) {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    return { data, error };
  },

  async uploadPieceFile(userId: string, folderName: string, file: File) {
    const path = `${userId}/${folderName}/${file.name}`;
    return await supabase.storage.from('pieces').upload(path, file);
  },

  async listPieceFiles(userId: string, folderName: string) {
    const { data, error } = await supabase.storage.from('pieces').list(`${userId}/${folderName}`);
    return { data, error };
  },

