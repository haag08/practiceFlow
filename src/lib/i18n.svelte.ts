import { settingsStore } from './stores/settings.svelte';

const translations: any = {
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      back: 'Back',
      upload: 'Upload',
      create: 'Create',
      logout: 'Logout',
      start: 'Start',
      pause: 'Pause',
      stop: 'Stop',
      done: 'Done',
      live: 'Live',
      min_today: 'minutes today',
      h: 'h'
    },
    home: {
      greeting_morning: 'Good Morning',
      greeting_afternoon: 'Good Afternoon',
      greeting_evening: 'Good Evening',
      greeting_night: 'Good Night',
      ready_session: 'Ready for your session?',
      start_session: 'Start Practice Session',
      todays_plan: "Today's Plan",
      quick_access: 'Quick Access',
      streak: 'Day Streak',
      target: 'Target',
      warmup: 'Warmup',
      warmup_sub: 'Long tones & lip slurs',
      technique: 'Technique',
      technique_sub: 'C Major Scale (120 BPM)'
    },
    profile: {
      title: 'Profile',
      subtitle: 'Your musical sanctuary',
      member_since: 'Member since',
      weekly_goal: 'Weekly Goal',
      practiced_today: 'm practiced today',
      h_week: 'h/week',
      app_settings: 'App Settings',
      music_settings: 'Music Settings',
      dark_mode: 'Dark Mode',
      notifications: 'Notifications',
      default_bpm: 'Default BPM',
      tuning_ref: 'Tuning Reference',
      language: 'Language',
      choose_avatar: 'Choose Avatar',
      upload_photo: 'Upload Photo'
    },
    pieces: {
      title: 'My Sheet Music',
      subtitle: 'Upload and organise your pieces',
      new_folder: 'New Folder',
      folder_name: 'Folder name...',
      upload_piece: 'Upload Piece',
      empty_library: 'Your library is empty.',
      empty_hint: 'Create a folder or upload your first piece of sheet music to get started.'
    },
    metronome: {
      title: 'Metronome',
      subtitle: 'Find your rhythm',
      tap_tempo: 'TAP TEMPO',
      sound: 'Sound',
      volume: 'Volume',
      sounds: {
        classic: 'Classic',
        woodblock: 'Woodblock',
        digital: 'Digital'
      }
    },
    tuner: {
      title: 'Tuner',
      subtitle: 'Perfect your intonation',
      listening: 'Listening...',
      ref_tone: 'Ref Tone',
      flat: 'Flat',
      perfect: 'Perfect',
      sharp: 'Sharp',
      cents: 'cents',
      instruments: {
        chromatic: 'Chromatic',
        clarinet: 'Clarinet (Bb)',
        piano: 'Piano'
      }
    },
    progress: {
      title: 'Progress',
      subtitle: 'Your musical journey',
      weekly_consistency: 'Great consistency this week! Keep it up.',
      ready_today: 'Ready for a focused session today?',
      current_streak: 'Current Streak',
      days: 'days',
      weekly_goal: 'Weekly Goal',
      this_week: 'This Week',
      total: 'total',
      total_hours: 'Total Hours',
      this_month: 'This month',
      sessions: 'Sessions',
      recent_history: 'Recent history',
      recent_sessions: 'Recent Sessions',
      no_sessions: 'No sessions recorded yet.'
    },
    session: {
      active_session: 'Active Session',
      current_focus: 'Current Focus',
      completed_blocks: 'Completed Blocks',
      finish_session: 'Finish Session',
      set_timer: 'Set Timer',
      minutes: 'minutes',
      remaining: 'remaining',
      congrats: 'Congratulations!',
      congrats_msg: 'You have reached your goal for this focus block.',
      warmup: 'Warmup',
      technique: 'Technique',
      repertoire: 'Repertoire',
      ensemble: 'Ensemble',
      quotes: [
        "Focus is the key to mastery.",
        "Every minute of practice brings you closer to your goal.",
        "Listen to the silence between the notes.",
        "Your only competition is who you were yesterday.",
        "Great things take time. Keep going.",
        "Precision first, speed will follow.",
        "Don't practice until you get it right, practice until you can't get it wrong.",
        "Consistency is the hallmark of the masters."
      ]
    },
    auth: {
      welcome_back: 'Welcome back to your sanctuary',
      start_journey: 'Start your musical journey today',
      full_name: 'Full Name',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      sign_in: 'Sign In',
      create_account: 'Create Account',
      no_account: "Don't have an account? Sign Up",
      has_account: 'Already have an account? Sign In',
      processing: 'Processing...',
      confirm_email: 'Check your email to confirm your account!'
    },
    nav: {
      home: 'Home',
      pieces: 'Pieces',
      progress: 'Progress',
      profile: 'Profile',
      metronome: 'Metronome',
      tuner: 'Tuner',
      timer: 'Timer'
    }
  },
  de: {
    common: {
      loading: 'Laden...',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      back: 'Zurück',
      upload: 'Hochladen',
      create: 'Erstellen',
      logout: 'Abmelden',
      start: 'Start',
      pause: 'Pause',
      stop: 'Stopp',
      done: 'Fertig',
      live: 'Live',
      min_today: 'Minuten heute',
      h: 'Std.'
    },
    home: {
      greeting_morning: 'Guten Morgen',
      greeting_afternoon: 'Guten Tag',
      greeting_evening: 'Guten Abend',
      greeting_night: 'Gute Nacht',
      ready_session: 'Bereit für deine Session?',
      start_session: 'Übungseinheit starten',
      todays_plan: 'Heutiger Plan',
      quick_access: 'Schnellzugriff',
      streak: 'Tage am Stück',
      target: 'Ziel',
      warmup: 'Einspielen',
      warmup_sub: 'Lange Töne & Bindungen',
      technique: 'Technik',
      technique_sub: 'C-Dur Tonleiter (120 BPM)'
    },
    profile: {
      title: 'Profil',
      subtitle: 'Dein musikalischer Rückzugsort',
      member_since: 'Mitglied seit',
      weekly_goal: 'Wochenziel',
      practiced_today: 'Min. heute geübt',
      h_week: 'Std./Woche',
      app_settings: 'App-Einstellungen',
      music_settings: 'Musik-Einstellungen',
      dark_mode: 'Dunkelmodus',
      notifications: 'Benachrichtigungen',
      default_bpm: 'Standard-BPM',
      tuning_ref: 'Stimm-Referenz',
      language: 'Sprache',
      choose_avatar: 'Avatar wählen',
      upload_photo: 'Foto hochladen'
    },
    pieces: {
      title: 'Meine Noten',
      subtitle: 'Organisiere deine Musikstücke',
      new_folder: 'Neuer Ordner',
      folder_name: 'Ordnername...',
      upload_piece: 'Stück hochladen',
      empty_library: 'Deine Bibliothek ist leer.',
      empty_hint: 'Erstelle einen Ordner oder lade dein erstes Stück hoch, um anzufangen.'
    },
    metronome: {
      title: 'Metronom',
      subtitle: 'Finde deinen Rhythmus',
      tap_tempo: 'TAP TEMPO',
      sound: 'Sound',
      volume: 'Lautstärke',
      sounds: {
        classic: 'Klassisch',
        woodblock: 'Holzblock',
        digital: 'Digital'
      }
    },
    tuner: {
      title: 'Stimmgerät',
      subtitle: 'Perfektioniere deine Intonation',
      listening: 'Höre zu...',
      ref_tone: 'Ref. Ton',
      flat: 'Zu tief',
      perfect: 'Perfekt',
      sharp: 'Zu hoch',
      cents: 'Cents',
      instruments: {
        chromatic: 'Chromatisch',
        clarinet: 'Klarinette (B)',
        piano: 'Klavier'
      }
    },
    progress: {
      title: 'Fortschritt',
      subtitle: 'Deine musikalische Reise',
      weekly_consistency: 'Tolle Beständigkeit diese Woche! Mach weiter so.',
      ready_today: 'Bereit für eine fokussierte Session heute?',
      current_streak: 'Aktuelle Serie',
      days: 'Tage',
      weekly_goal: 'Wochenziel',
      this_week: 'Diese Woche',
      total: 'gesamt',
      total_hours: 'Gesamtstunden',
      this_month: 'Diesen Monat',
      sessions: 'Sessions',
      recent_history: 'Letzte Aktivitäten',
      recent_sessions: 'Letzte Sessions',
      no_sessions: 'Noch keine Sessions aufgezeichnet.'
    },
    session: {
      active_session: 'Active Session',
      current_focus: 'Aktueller Fokus',
      completed_blocks: 'Abgeschlossene Blöcke',
      finish_session: 'Session beenden',
      set_timer: 'Timer setzen',
      minutes: 'Minuten',
      remaining: 'verbleibend',
      congrats: 'Herzlichen Glückwunsch!',
      congrats_msg: 'Du hast dein Ziel für diesen Block erreicht.',
      warmup: 'Einspielen',
      technique: 'Technik',
      repertoire: 'Repertoire',
      ensemble: 'Ensemble',
      quotes: [
        "Fokus ist der Schlüssel zur Meisterschaft.",
        "Jede Minute Übung bringt dich deinem Ziel näher.",
        "Höre auf die Stille zwischen den Noten.",
        "Deine einzige Konkurrenz ist die Person, die du gestern warst.",
        "Große Dinge brauchen Zeit. Bleib dran.",
        "Präzision zuerst, Schnelligkeit folgt von selbst.",
        "Übe nicht, bis du es richtig machst. Übe, bis du es nicht mehr falsch machen kannst.",
        "Beständigkeit ist das Markenzeichen der Meister."
      ]
    },
    auth: {
      welcome_back: 'Willkommen zurück in deinem Rückzugsort',
      start_journey: 'Beginne heute deine musikalische Reise',
      full_name: 'Vollständiger Name',
      username: 'Benutzername',
      email: 'E-Mail',
      password: 'Passwort',
      sign_in: 'Anmelden',
      create_account: 'Konto erstellen',
      no_account: 'Noch kein Konto? Registrieren',
      has_account: 'Bereits ein Konto? Anmelden',
      processing: 'Wird verarbeitet...',
      confirm_email: 'Prüfe deine E-Mails, um dein Konto zu bestätigen!'
    },
    nav: {
      home: 'Home',
      pieces: 'Noten',
      progress: 'Fortschritt',
      profile: 'Profil',
      metronome: 'Metronom',
      tuner: 'Stimmgerät',
      timer: 'Timer'
    }
  }
};

class I18nStore {
  t = $derived((path: string) => {
    const lang = settingsStore.settings.language || 'en';
    const keys = path.split('.');
    let current = translations[lang];
    
    for (const key of keys) {
      if (!current || current[key] === undefined) return path;
      current = current[key];
    }
    
    return current;
  });
}

export const i18n = new I18nStore();
