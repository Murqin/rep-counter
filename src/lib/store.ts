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
  totalRounds: 0,
  timeLeft: 0,
  lastTick: null
});

export const settingsStore = persistentWritable<Settings>('rep-settings', {
  autoAdvance: true,
  theme: 'dark',
  enableFeedback: true
});

export const presetsStore = persistentWritable<Preset[]>('rep-presets', []);

export function startRest(duration: number) {
  sessionStore.update(s => ({
    ...s,
    isResting: true,
    timeLeft: duration,
    lastTick: Date.now()
  }));
}

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
    if (s.isResting) return s;
    let nextRep = s.currentRep + 1;
    let nextRound = s.currentRound;
    let isResting: boolean = s.isResting;
    let timeLeft = s.timeLeft;
    let lastTick = s.lastTick;

    if (nextRep >= targetReps && autoAdvance) {
      nextRep = 0;
      nextRound++;
      feedbackSuccess();
      // Only set resting if we haven't finished all rounds AND duration > 0
      if (nextRound <= s.totalRounds && breakDuration > 0) {
        isResting = true;
        timeLeft = breakDuration;
        lastTick = Date.now();
      }
    } else {
      feedbackRep();
    }
    
    return { ...s, currentRep: nextRep, currentRound: nextRound, isResting, timeLeft, lastTick };
  });
}

export function manualAdvance(breakDuration: number) {
  feedbackSuccess();
  sessionStore.update(s => {
    const isResting = breakDuration > 0;
    return {
      ...s,
      currentRep: 0,
      currentRound: s.currentRound + 1,
      isResting,
      timeLeft: isResting ? breakDuration : 0,
      lastTick: isResting ? Date.now() : null
    };
  });
}

export function endRest() {
  feedbackSuccess();
  sessionStore.update(s => ({ ...s, isResting: false, timeLeft: 0, lastTick: null }));
}

export function completeSet(targetReps: number, autoAdvance: boolean, breakDuration: number) {
  sessionStore.update(s => {
    if (s.isResting) return s;
    
    let nextRound = s.currentRound;
    let isResting: boolean = s.isResting;
    let timeLeft = s.timeLeft;
    let lastTick = s.lastTick;

    feedbackSuccess();

    if (autoAdvance) {
      nextRound++;
      if (nextRound <= s.totalRounds && breakDuration > 0) {
        isResting = true;
        timeLeft = breakDuration;
        lastTick = Date.now();
      }
    }
    
    return { 
      ...s, 
      currentRep: autoAdvance ? 0 : targetReps, 
      currentRound: nextRound, 
      isResting,
      timeLeft,
      lastTick
    };
  });
}
