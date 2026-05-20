import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { settingsStore } from '../../src/lib/store';
import { t, translations, availableLanguages, languageNames } from '../../src/lib/i18n';

describe('i18n localization system', () => {
  beforeEach(() => {
    // Reset to default language before each test
    settingsStore.set({
      autoAdvance: true,
      theme: 'dark',
      enableFeedback: true,
      lang: 'en'
    });
  });

  it('translates English keys correctly by default', () => {
    const translate = get(t);
    expect(translate('settings')).toBe('Settings');
    expect(translate('sessionComplete')).toBe('Session Complete');
    expect(translate('breakTime')).toBe('BREAK');
  });

  it('translates Turkish keys correctly when settings change', () => {
    // Switch language to Turkish
    settingsStore.update(s => ({ ...s, lang: 'tr' }));
    
    const translate = get(t);
    expect(translate('settings')).toBe('Ayarlar');
    expect(translate('sessionComplete')).toBe('Antrenman Bitti');
    expect(translate('breakTime')).toBe('MOLA');
  });

  it('falls back to English translation if key is missing in Turkish translation dictionary', () => {
    // Add temporary key to translations for testing fallback
    // @ts-ignore
    translations.en.testFallback = 'Fallback Value';
    
    settingsStore.update(s => ({ ...s, lang: 'tr' }));
    const translate = get(t);
    
    // @ts-ignore
    expect(translate('testFallback')).toBe('Fallback Value');
    
    // Cleanup
    // @ts-ignore
    delete translations.en.testFallback;
  });

  it('returns the key itself if it does not exist in any dictionary', () => {
    const translate = get(t);
    // @ts-ignore
    expect(translate('nonExistentKey')).toBe('nonExistentKey');
  });

  it('availableLanguages is derived automatically from the translations object', () => {
    // Must contain exactly the keys defined in translations
    expect(availableLanguages).toContain('en');
    expect(availableLanguages).toContain('tr');
    expect(availableLanguages.length).toBe(Object.keys(translations).length);
  });

  it('languageNames provides a human-readable display name for each language code', () => {
    expect(languageNames['en']).toBe('English');
    expect(languageNames['tr']).toBe('Türkçe');
    // Every available language should have a display name entry
    availableLanguages.forEach(code => {
      expect(languageNames[code]).toBeTruthy();
    });
  });
});
