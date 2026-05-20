import { writable } from 'svelte/store';
import type { SessionState, Preset, Settings } from './types';
import { feedbackRep, feedbackSuccess } from './feedback';

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
  isTransitioning: false,
  totalRounds: 0,
  timeLeft: 0,
  lastTick: null
});

export const settingsStore = persistentWritable<Settings>('rep-settings', {
  autoAdvance: true,
  theme: 'dark',
  enableFeedback: true,
  lang: typeof navigator !== 'undefined' && navigator.language.startsWith('tr') ? 'tr' : 'en'
});

export const presetsStore = persistentWritable<Preset[]>('rep-presets', []);

export const wakeLockActive = writable(false);

export function updateTimer() {
  sessionStore.update(s => {
    if (!s.isResting || s.timeLeft <= 0) return s;
    const now = Date.now();
    const elapsed = s.lastTick ? Math.floor((now - s.lastTick) / 1000) : 0;
    if (elapsed >= 1) {
      const nextTime = Math.max(0, s.timeLeft - elapsed);
      return { ...s, timeLeft: nextTime, lastTick: now };
    }
    return s;
  });
}

export function incrementRep(targetReps: number, autoAdvance: boolean, breakDuration: number) {
  sessionStore.update(s => {
    if (s.isResting || s.isTransitioning) return s;
    let nextRep = s.currentRep + 1;
    let nextRound = s.currentRound;
    let isResting: boolean = s.isResting;
    let isTransitioning: boolean = false;
    let timeLeft = s.timeLeft;
    let lastTick = s.lastTick;

    if (nextRep >= targetReps && autoAdvance) {
      feedbackSuccess();
      if (nextRound < s.totalRounds) {
        if (breakDuration > 0) {
          nextRep = 0;
          nextRound++;
          isResting = true;
          timeLeft = breakDuration;
          lastTick = Date.now();
        } else {
          // 0s Rest: Set transitioning to true to pause visually
          isTransitioning = true;
          // We'll reset this after a timeout in the component or a helper
        }
      } else {
        // Last round complete
        nextRound++;
      }
    } else {
      feedbackRep();
    }
    
    return { ...s, currentRep: nextRep, currentRound: nextRound, isResting, isTransitioning, timeLeft, lastTick };
  });
}

export function advanceRound() {
  sessionStore.update(s => ({
    ...s,
    currentRep: 0,
    currentRound: s.currentRound + 1,
    isTransitioning: false
  }));
}

export function manualAdvance(breakDuration: number) {
  feedbackSuccess();
  sessionStore.update(s => {
    const shouldRest = breakDuration > 0;
    if (!shouldRest) {
      return { ...s, isTransitioning: true };
    }
    return {
      ...s,
      currentRep: 0,
      currentRound: s.currentRound + 1,
      isResting: true,
      timeLeft: breakDuration,
      lastTick: Date.now()
    };
  });
}

export function endRest() {
  feedbackSuccess();
  sessionStore.update(s => ({ ...s, isResting: false, isTransitioning: false, timeLeft: 0, lastTick: null }));
}

export function completeSet(targetReps: number, autoAdvance: boolean, breakDuration: number) {
  sessionStore.update(s => {
    if (s.isResting || s.isTransitioning) return s;
    
    let nextRound = s.currentRound;
    let isResting: boolean = s.isResting;
    let isTransitioning: boolean = false;
    let timeLeft = s.timeLeft;
    let lastTick = s.lastTick;

    feedbackSuccess();

    if (autoAdvance) {
      if (nextRound < s.totalRounds) {
        if (breakDuration > 0) {
          isResting = true;
          timeLeft = breakDuration;
          lastTick = Date.now();
          return { ...s, currentRep: 0, currentRound: nextRound + 1, isResting, timeLeft, lastTick };
        } else {
          isTransitioning = true;
          return { ...s, currentRep: targetReps, isTransitioning };
        }
      } else {
        nextRound++;
        return { ...s, currentRep: 0, currentRound: nextRound };
      }
    }
    
    return { 
      ...s, 
      currentRep: targetReps, 
      isResting,
      isTransitioning,
      timeLeft,
      lastTick
    };
  });
}
