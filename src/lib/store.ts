import { writable } from 'svelte/store';
import type { SessionState, Preset, Settings } from './types';

function persistentWritable<T>(key: string, initialValue: T) {
  let storedValue = null;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
    storedValue = localStorage.getItem(key);
  }
  const store = writable<T>(storedValue ? JSON.parse(storedValue) : initialValue);
  
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
  isResting: false
});

export const settingsStore = persistentWritable<Settings>('rep-settings', {
  autoAdvance: true
});

export const presetsStore = persistentWritable<Preset[]>('rep-presets', []);

export function incrementRep(targetReps: number, autoAdvance: boolean) {
  sessionStore.update(s => {
    let nextRep = s.currentRep + 1;
    let nextRound = s.currentRound;
    let isResting = s.isResting;

    if (nextRep >= targetReps && autoAdvance) {
      nextRep = 0;
      nextRound++;
      isResting = true;
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
