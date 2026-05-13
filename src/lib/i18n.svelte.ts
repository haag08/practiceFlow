import { settingsStore } from './settings.svelte';

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
      logout: 'Logout'
    },
    home: {
      greeting: 'Good Evening',
      ready_session: 'Ready for your Nocturnal Session?',
      start_session: 'Start Practice Session',
      todays_plan: "Today's Plan",
      quick_access: 'Quick Access',
      streak: 'Day Streak',
      target: 'Target'
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
    nav: {
      home: 'Home',
      pieces: 'Pieces',
      progress: 'Progress',
      profile: 'Profile'
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
      logout: 'Abmelden'
    },
    home: {
      greeting: 'Guten Abend',
      ready_session: 'Bereit für deine Session?',
      start_session: 'Übungseinheit starten',
      todays_plan: 'Heutiger Plan',
      quick_access: 'Schnellzugriff',
      streak: 'Tage am Stück',
      target: 'Ziel'
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
    nav: {
      home: 'Home',
      pieces: 'Noten',
      progress: 'Fortschritt',
      profile: 'Profil'
    }
  }
};

class I18nStore {
  t = $derived((path: string) => {
    const lang = settingsStore.settings.language || 'en';
    const keys = path.split('.');
    let current = translations[lang];
    
    for (const key of keys) {
      if (current[key] === undefined) return path;
      current = current[key];
    }
    
    return current;
  });
}

export const i18n = new I18nStore();
