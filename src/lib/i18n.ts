import { derived } from 'svelte/store';
import { settingsStore } from './store';

export const translations = {
  en: {
    // App Header / Settings
    settings: 'Settings',
    preferences: 'Preferences',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    soundHaptics: 'Sound & Haptics',
    screenWakeLock: 'Screen Wake Lock',
    wakeLockDescription: 'Prevents screen from turning off',
    active: 'Active',
    inactive: 'Inactive',
    presets: 'Presets',
    rounds: 'rounds',
    reps: 'reps',
    break: 's break',
    editPreset: 'Edit Preset',
    newPreset: 'New Preset',
    cancelEdit: 'Cancel Edit',
    name: 'Name',
    routineNamePlaceholder: 'Routine name...',
    roundsLabel: 'Rounds',
    repsLabel: 'Reps',
    breakLabel: 'Break (s)',
    saveChanges: 'Save Changes',
    createPreset: 'Create Preset',
    supportCommunity: 'Support & Community',
    enjoyApp: 'If you enjoy this app, consider supporting it by giving a star on GitHub!',
    buyMeCoffee: 'Buy Me a Coffee',
    starOnGithub: 'Star on GitHub',
    reportBug: 'Report a Bug',
    version: 'Rep Counter v1.0.0',
    
    // Success Screen
    sessionComplete: 'Session Complete',
    reachedGoal: "You've reached your goal",
    restartPreset: 'RESTART PRESET',
    backToMenu: 'BACK TO MENU',
    
    // Timer Screen
    breakTime: 'BREAK',
    skipBreak: 'SKIP BREAK',
    
    // Quick Adjust Modal
    targetReps: 'Target Reps',
    breakTimeSeconds: 'Break Time (s)',
    totalRounds: 'Total Rounds',
    done: 'DONE',
    
    // Counter Screen
    round: 'Round',
    targetRepsHeader: 'TARGET REPS',
    finishRound: 'FINISH ROUND',
    nextRound: 'NEXT ROUND',
    
    // Languages
    language: 'Language',
    turkish: 'Turkish',
    english: 'English'
  },
  tr: {
    // App Header / Settings
    settings: 'Ayarlar',
    preferences: 'Tercihler',
    theme: 'Tema',
    dark: 'Karanlık',
    light: 'Aydınlık',
    soundHaptics: 'Ses ve Titreşim',
    screenWakeLock: 'Ekranı Uyanık Tut',
    wakeLockDescription: 'Ekranın kapanmasını engeller',
    active: 'Aktif',
    inactive: 'Pasif',
    presets: 'Hazır Programlar',
    rounds: 'tur',
    reps: 'tekrar',
    break: 'sn ara',
    editPreset: 'Programı Düzenle',
    newPreset: 'Yeni Program',
    cancelEdit: 'Düzenlemeyi İptal Et',
    name: 'İsim',
    routineNamePlaceholder: 'Program adı...',
    roundsLabel: 'Tur Sayısı',
    repsLabel: 'Tekrar Sayısı',
    breakLabel: 'Mola (sn)',
    saveChanges: 'Değişiklikleri Kaydet',
    createPreset: 'Program Oluştur',
    supportCommunity: 'Destek ve Topluluk',
    enjoyApp: 'Bu uygulamayı beğendiyseniz GitHub üzerinden yıldız vererek destek olabilirsiniz!',
    buyMeCoffee: 'Bana Bir Kahve Ismarla',
    starOnGithub: 'GitHub\'da Yıldızla',
    reportBug: 'Hata Bildir',
    version: 'Rep Counter v1.0.0',
    
    // Success Screen
    sessionComplete: 'Antrenman Bitti',
    reachedGoal: 'Hedefinize ulaştınız',
    restartPreset: 'PROGRAMI YENİDEN BAŞLAT',
    backToMenu: 'MENÜYE DÖN',
    
    // Timer Screen
    breakTime: 'MOLA',
    skipBreak: 'MOLAYI ATLA',
    
    // Quick Adjust Modal
    targetReps: 'Hedef Tekrar',
    breakTimeSeconds: 'Mola Süresi (sn)',
    totalRounds: 'Toplam Tur',
    done: 'TAMAM',
    
    // Counter Screen
    round: 'Tur',
    targetRepsHeader: 'HEDEF TEKRAR',
    finishRound: 'TURU BİTİR',
    nextRound: 'SONRAKİ TUR',
    
    // Languages
    language: 'Dil',
    turkish: 'Türkçe',
    english: 'İngilizce'
  }
};

// Native display names for each supported language code
export const languageNames: Record<string, string> = {
  en: 'English',
  tr: 'Türkçe'
};

// All supported language codes, automatically derived from the translations object.
// Adding a new language block to translations is enough — no UI changes needed.
export const availableLanguages = Object.keys(translations);

// Derived store that returns a reactive $t translator function
export const t = derived(settingsStore, ($settings) => {
  const lang = $settings.lang || 'en';
  return (key: keyof typeof translations['en']) => {
    return translations[lang][key] || translations['en'][key] || key;
  };
});
