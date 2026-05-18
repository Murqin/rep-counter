import { writable } from 'svelte/store';
import type { SessionState, Preset, Settings } from './types';

export function persistentWritable<T>(key: string, initialValue: T) {
  let storedValue = null;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
    storedValue = localStorage.getItem(key);
  }
  
  let parsedValue = initialValue;
  if (storedValue) {
    try {
      parsedValue = JSON.parse(storedValue);
    } catch (e) {
      // Failed to parse localStorage
    }
  }

  const store = writable<T>(parsedValue);
  
  store.subscribe(value => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });
  return store;
}

export const sessionStore = persistentWritable<SessionState>('rep-session', {
  activePresetId: null,
  currentRound: 1,
  currentRep: 0,
  isResting: false,
  totalRounds: 0
});

export const settingsStore = persistentWritable<Settings>('rep-settings', {
  autoAdvance: true
});

export const presetsStore = persistentWritable<Preset[]>('rep-presets', []);

export function incrementRep(targetReps: number, autoAdvance: boolean) {
  sessionStore.update(s => {
    if (s.isResting) return s;
    let nextRep = s.currentRep + 1;
    let nextRound = s.currentRound;
    let isResting = s.isResting;

    if (nextRep >= targetReps && autoAdvance) {
      nextRep = 0;
      nextRound++;
      // Only set resting if we haven't finished all rounds
      if (nextRound <= s.totalRounds) {
        isResting = true;
      }
    }
    
    return { ...s, currentRep: nextRep, currentRound: nextRound, isResting };
  });
}

export function manualAdvance() {
  sessionStore.update(s => ({
    ...s,
    currentRep: 0,
    currentRound: s.currentRound + 1,
    isResting: true
  }));
}

export function endRest() {
  sessionStore.update(s => ({ ...s, isResting: false }));
}
