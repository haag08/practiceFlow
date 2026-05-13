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

  getPublicAvatarUrl(path: string) {
    return supabase.storage.from('avatars').getPublicUrl(path);
  },

  // Pieces Management
  async createFolder(userId: string, folderName: string) {
    return await supabase.from('folders').insert({ user_id: userId, name: folderName }).select().single();
  },

  async getFolders(userId: string) {
    return await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('name');
  },

  async deleteFolder(folderId: string) {
    return await supabase.from('folders').delete().eq('id', folderId);
  },

  async uploadPieceFile(userId: string, folderId: string | null, file: File) {
    // 1. Upload to Storage
    const timestamp = Date.now();
    const storagePath = `${userId}/${folderId || 'root'}/${timestamp}_${file.name}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('pieces')
      .upload(storagePath, file);

    if (storageError) return { data: null, error: storageError };

    // 2. Save to DB
    return await supabase.from('pieces_files').insert({
      user_id: userId,
      folder_id: folderId,
      name: file.name,
      storage_path: storagePath
    }).select().single();
  },

  async getPieces(userId: string, folderId: string | null) {
    let query = supabase
      .from('pieces_files')
      .select('*')
      .eq('user_id', userId);
    
    if (folderId) {
      query = query.eq('folder_id', folderId);
    } else {
      query = query.is('folder_id', null);
    }

    return await query.order('created_at', { ascending: false });
  },

  async deletePiece(pieceId: string, storagePath: string) {
    // 1. Delete from Storage
    await supabase.storage.from('pieces').remove([storagePath]);
    
    // 2. Delete from DB
    return await supabase.from('pieces_files').delete().eq('id', pieceId);
  },

  getPiecePublicUrl(storagePath: string) {
    return supabase.storage.from('pieces').getPublicUrl(storagePath);
  }
};
