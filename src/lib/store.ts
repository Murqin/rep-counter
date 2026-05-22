import { writable, get } from 'svelte/store';
import type { SessionState, Preset, Settings } from './types';
import { feedbackRep, feedbackSuccess } from './feedback';

// --- Security: Input Sanitization (F-1) ---

/**
 * Strips HTML-special characters from user-provided strings to prevent XSS
 * if code ever renders names via {@html ...} in the future.
 * Also enforces a max length of 100 characters.
 */
export function sanitizeName(raw: string): string {
  return raw.replace(/[<>"'&`]/g, '').trim().slice(0, 100);
}

// --- Security: Schema Validators (F-2) ---

/**
 * Validates and sanitizes a raw SessionState object read from localStorage.
 * Rejects NaN, negative numbers, booleans in wrong fields, etc.
 */
function validateSession(data: unknown): SessionState {
  const defaults: SessionState = {
    activePresetId: null,
    workoutType: 'classic',
    currentRound: 1,
    currentRep: 0,
    isResting: false,
    isTransitioning: false,
    totalRounds: 0,
    timeLeft: 0,
    lastTick: null,
    amrapRoundsCompleted: 0
  };
  if (!data || typeof data !== 'object') return defaults;
  const d = data as Record<string, unknown>;
  return {
    activePresetId: typeof d.activePresetId === 'string' ? d.activePresetId : null,
    workoutType:    d.workoutType === 'classic' || d.workoutType === 'emom' || d.workoutType === 'tabata' || d.workoutType === 'amrap' ? d.workoutType : 'classic',
    currentRound:   Number.isFinite(d.currentRound)  && (d.currentRound as number) >= 1  ? Math.floor(d.currentRound as number)  : 1,
    currentRep:     Number.isFinite(d.currentRep)    && (d.currentRep as number) >= 0    ? Math.floor(d.currentRep as number)    : 0,
    isResting:      typeof d.isResting === 'boolean'       ? d.isResting       : false,
    isTransitioning: false, // Always reset on load — prevents stuck transition state
    totalRounds:    Number.isFinite(d.totalRounds)   && (d.totalRounds as number) >= 0   ? Math.floor(d.totalRounds as number)   : 0,
    timeLeft:       Number.isFinite(d.timeLeft)      && (d.timeLeft as number) >= 0      ? Math.floor(d.timeLeft as number)      : 0,
    lastTick:       null, // Always reset lastTick on load to avoid phantom timer deltas
    amrapRoundsCompleted: Number.isFinite(d.amrapRoundsCompleted) && (d.amrapRoundsCompleted as number) >= 0 ? Math.floor(d.amrapRoundsCompleted as number) : 0
  };
}

/**
 * Validates a raw Settings object read from localStorage.
 * Falls back to safe defaults for any invalid or missing field.
 */
function validateSettings(data: unknown): Settings {
  const defaults: Settings = { autoAdvance: true, theme: 'dark', enableFeedback: true, lang: 'en' };
  if (!data || typeof data !== 'object') return defaults;
  const d = data as Record<string, unknown>;
  return {
    autoAdvance:     typeof d.autoAdvance === 'boolean' ? d.autoAdvance : defaults.autoAdvance,
    theme:           d.theme === 'dark' || d.theme === 'light' ? d.theme : defaults.theme,
    enableFeedback:  typeof d.enableFeedback === 'boolean' ? d.enableFeedback : defaults.enableFeedback,
    lang:            d.lang === 'en' || d.lang === 'tr' ? d.lang : defaults.lang
  };
}

/**
 * Validates a raw Preset array from localStorage.
 * Filters out malformed entries and sanitizes preset names.
 */
function validatePresets(data: unknown): Preset[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(p =>
      p && typeof p === 'object' &&
      typeof p.id === 'string' && p.id.length > 0 &&
      typeof p.name === 'string' && p.name.trim().length > 0 &&
      Number.isFinite(p.rounds) && p.rounds >= 1 &&
      Number.isFinite(p.repsPerRound) && p.repsPerRound >= 1 &&
      Number.isFinite(p.breakDuration) && p.breakDuration >= 0
    )
    .map(p => ({
      id:           p.id as string,
      name:         sanitizeName(p.name as string), // Sanitize on read too
      type:         p.type === 'classic' || p.type === 'emom' || p.type === 'tabata' || p.type === 'amrap' ? p.type : 'classic',
      rounds:       Math.min(Math.floor(p.rounds), 999),
      repsPerRound: Math.min(Math.floor(p.repsPerRound), 9999),
      breakDuration: Math.min(Math.floor(p.breakDuration), 3600),
      workDuration: p.workDuration !== undefined && Number.isFinite(p.workDuration) ? Math.min(Math.max(1, Math.floor(p.workDuration)), 3600) : 20,
      emomInterval: p.emomInterval !== undefined && Number.isFinite(p.emomInterval) ? Math.min(Math.max(1, Math.floor(p.emomInterval)), 3600) : 60,
      amrapDuration: p.amrapDuration !== undefined && Number.isFinite(p.amrapDuration) ? Math.min(Math.max(1, Math.floor(p.amrapDuration)), 86400) : 600
    }));
}

// --- Persistent Store Factory ---

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
      // Failed to parse localStorage — use default
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

export const sessionStore = persistentWritable<SessionState>('rep-session',
  validateSession(
    (() => { try { return JSON.parse(typeof localStorage !== 'undefined' ? localStorage.getItem('rep-session') ?? 'null' : 'null'); } catch { return null; } })()
  ) ?? {
    activePresetId: null, workoutType: 'classic', currentRound: 1, currentRep: 0,
    isResting: false, isTransitioning: false, totalRounds: 0, timeLeft: 0, lastTick: null, amrapRoundsCompleted: 0
  }
);

export const settingsStore = persistentWritable<Settings>('rep-settings',
  validateSettings(
    (() => { try { return JSON.parse(typeof localStorage !== 'undefined' ? localStorage.getItem('rep-settings') ?? 'null' : 'null'); } catch { return null; } })()
  ) ?? {
    autoAdvance: true, theme: 'dark', enableFeedback: true,
    lang: typeof navigator !== 'undefined' && navigator.language.startsWith('tr') ? 'tr' : 'en'
  }
);

export const presetsStore = persistentWritable<Preset[]>('rep-presets',
  validatePresets(
    (() => { try { return JSON.parse(typeof localStorage !== 'undefined' ? localStorage.getItem('rep-presets') ?? 'null' : 'null'); } catch { return null; } })()
  ) ?? []
);

export const wakeLockActive = writable(false);

export function handleClassicTimerExpiry(s: SessionState): SessionState {
  return {
    ...s,
    isResting: false,
    isTransitioning: false,
    timeLeft: 0,
    lastTick: null
  };
}

export function handleEmomTimerExpiry(s: SessionState): SessionState {
  const presets = get(presetsStore);
  const activePreset = presets.find(p => p.id === s.activePresetId);
  if (s.currentRound < s.totalRounds) {
    const interval = activePreset?.emomInterval ?? 60;
    return {
      ...s,
      currentRound: s.currentRound + 1,
      currentRep: 0,
      isResting: false,
      isTransitioning: false,
      timeLeft: interval,
      lastTick: Date.now()
    };
  } else {
    return {
      ...s,
      currentRound: s.currentRound + 1,
      isResting: false,
      isTransitioning: false,
      timeLeft: 0,
      lastTick: null
    };
  }
}

export function handleTabataTimerExpiry(s: SessionState): SessionState {
  const presets = get(presetsStore);
  const activePreset = presets.find(p => p.id === s.activePresetId);
  if (!s.isResting) {
    const restSec = activePreset?.breakDuration ?? 10;
    return {
      ...s,
      isResting: true,
      timeLeft: restSec,
      lastTick: Date.now()
    };
  } else {
    if (s.currentRound < s.totalRounds) {
      const workSec = activePreset?.workDuration ?? 20;
      return {
        ...s,
        currentRound: s.currentRound + 1,
        currentRep: 0,
        isResting: false,
        timeLeft: workSec,
        lastTick: Date.now()
      };
    } else {
      return {
        ...s,
        currentRound: s.currentRound + 1,
        isResting: false,
        timeLeft: 0,
        lastTick: null
      };
    }
  }
}

export function handleAmrapTimerExpiry(s: SessionState): SessionState {
  return {
    ...s,
    currentRound: s.totalRounds + 1,
    timeLeft: 0,
    lastTick: null
  };
}

export function handleTimerExpiry(s: SessionState): SessionState {
  feedbackSuccess();
  const type = s.workoutType || 'classic';
  if (type === 'emom') return handleEmomTimerExpiry(s);
  if (type === 'tabata') return handleTabataTimerExpiry(s);
  if (type === 'amrap') return handleAmrapTimerExpiry(s);
  return handleClassicTimerExpiry(s);
}

export function updateTimer() {
  sessionStore.update(s => {
    if ((s.workoutType === 'classic' || !s.workoutType) && !s.isResting) return s;
    if (s.timeLeft <= 0) return s;

    const now = Date.now();
    const elapsed = s.lastTick ? Math.floor((now - s.lastTick) / 1000) : 0;
    if (elapsed >= 1) {
      const nextTime = Math.max(0, s.timeLeft - elapsed);
      let updated: SessionState = { ...s, timeLeft: nextTime, lastTick: now };
      
      if (nextTime === 0) {
        updated = handleTimerExpiry(updated);
      }
      return updated;
    }
    return s;
  });
}

export function incrementClassicRep(targetReps: number, autoAdvance: boolean, breakDuration: number) {
  sessionStore.update(s => {
    if (s.isTransitioning || s.isResting) return s;

    let nextRep = s.currentRep + 1;
    let nextRound = s.currentRound;
    let isResting = s.isResting;
    let isTransitioning = false;
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
          isTransitioning = true;
        }
      } else {
        nextRound++;
      }
    } else {
      feedbackRep();
    }

    return { ...s, currentRep: nextRep, currentRound: nextRound, isResting, isTransitioning, timeLeft, lastTick };
  });
}

export function incrementEmomRep(targetReps: number) {
  sessionStore.update(s => {
    if (s.isTransitioning || s.isResting) return s;

    let nextRep = s.currentRep + 1;
    let isResting = s.isResting;

    if (nextRep >= targetReps) {
      feedbackSuccess();
      isResting = true;
    } else {
      feedbackRep();
    }

    return { ...s, currentRep: nextRep, isResting };
  });
}

export function incrementTabataRep() {
  sessionStore.update(s => {
    if (s.isTransitioning || s.isResting) return s;
    feedbackRep();
    return { ...s, currentRep: s.currentRep + 1 };
  });
}

export function incrementAmrapRep(targetReps: number) {
  sessionStore.update(s => {
    if (s.isTransitioning || s.isResting) return s;

    let nextRep = s.currentRep + 1;
    let nextRound = s.currentRound;
    let amrapRoundsCompleted = s.amrapRoundsCompleted ?? 0;

    if (nextRep >= targetReps) {
      feedbackSuccess();
      amrapRoundsCompleted++;
      nextRound++;
      nextRep = 0;
    } else {
      feedbackRep();
    }

    return { ...s, currentRep: nextRep, currentRound: nextRound, amrapRoundsCompleted };
  });
}

export function incrementRep(targetReps: number, autoAdvance: boolean, breakDuration: number) {
  const s = get(sessionStore);
  const type = s.workoutType || 'classic';
  if (type === 'amrap') {
    incrementAmrapRep(targetReps);
  } else if (type === 'emom') {
    incrementEmomRep(targetReps);
  } else if (type === 'tabata') {
    incrementTabataRep();
  } else {
    incrementClassicRep(targetReps, autoAdvance, breakDuration);
  }
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

export function endClassicRest() {
  sessionStore.update(s => ({
    ...s,
    isResting: false,
    isTransitioning: false,
    timeLeft: 0,
    lastTick: null
  }));
}

export function endEmomRest() {
  sessionStore.update(s => {
    const presets = get(presetsStore);
    const activePreset = presets.find(p => p.id === s.activePresetId);
    const interval = activePreset?.emomInterval ?? 60;
    if (s.currentRound < s.totalRounds) {
      return {
        ...s,
        currentRound: s.currentRound + 1,
        currentRep: 0,
        isResting: false,
        timeLeft: interval,
        lastTick: Date.now()
      };
    } else {
      return {
        ...s,
        currentRound: s.currentRound + 1,
        isResting: false,
        timeLeft: 0,
        lastTick: null
      };
    }
  });
}

export function endTabataRest() {
  sessionStore.update(s => {
    const presets = get(presetsStore);
    const activePreset = presets.find(p => p.id === s.activePresetId);
    const workSec = activePreset?.workDuration ?? 20;
    if (s.currentRound < s.totalRounds) {
      return {
        ...s,
        currentRound: s.currentRound + 1,
        currentRep: 0,
        isResting: false,
        timeLeft: workSec,
        lastTick: Date.now()
      };
    } else {
      return {
        ...s,
        currentRound: s.currentRound + 1,
        isResting: false,
        timeLeft: 0,
        lastTick: null
      };
    }
  });
}

export function endRest() {
  feedbackSuccess();
  const s = get(sessionStore);
  const type = s.workoutType || 'classic';
  if (type === 'emom') {
    endEmomRest();
  } else if (type === 'tabata') {
    endTabataRest();
  } else {
    endClassicRest();
  }
}

export function completeClassicSet(targetReps: number, autoAdvance: boolean, breakDuration: number) {
  sessionStore.update(s => {
    if (s.isTransitioning || s.isResting) return s;

    feedbackSuccess();

    let nextRound = s.currentRound;
    let isResting = s.isResting;
    let isTransitioning = false;
    let timeLeft = s.timeLeft;
    let lastTick = s.lastTick;

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

export function completeEmomSet(targetReps: number) {
  sessionStore.update(s => {
    if (s.isTransitioning || s.isResting) return s;

    feedbackSuccess();

    return {
      ...s,
      currentRep: targetReps,
      isResting: true
    };
  });
}

export function completeTabataSet() {
  sessionStore.update(s => {
    if (s.isTransitioning) return s;

    feedbackSuccess();

    if (!s.isResting) {
      const presets = get(presetsStore);
      const activePreset = presets.find(p => p.id === s.activePresetId);
      const restSec = activePreset?.breakDuration ?? 10;
      return {
        ...s,
        isResting: true,
        timeLeft: restSec,
        lastTick: Date.now()
      };
    } else {
      if (s.currentRound < s.totalRounds) {
        const presets = get(presetsStore);
        const activePreset = presets.find(p => p.id === s.activePresetId);
        const workSec = activePreset?.workDuration ?? 20;
        return {
          ...s,
          currentRound: s.currentRound + 1,
          currentRep: 0,
          isResting: false,
          timeLeft: workSec,
          lastTick: Date.now()
        };
      } else {
        return {
          ...s,
          currentRound: s.currentRound + 1,
          isResting: false,
          timeLeft: 0,
          lastTick: null
        };
      }
    }
  });
}

export function completeAmrapSet() {
  sessionStore.update(s => {
    if (s.isTransitioning || s.isResting) return s;

    feedbackSuccess();

    let nextRound = s.currentRound;
    let amrapRoundsCompleted = s.amrapRoundsCompleted ?? 0;

    amrapRoundsCompleted++;
    nextRound++;
    return {
      ...s,
      currentRep: 0,
      currentRound: nextRound,
      amrapRoundsCompleted
    };
  });
}

export function completeSet(targetReps: number, autoAdvance: boolean, breakDuration: number) {
  const s = get(sessionStore);
  const type = s.workoutType || 'classic';
  if (type === 'amrap') {
    completeAmrapSet();
  } else if (type === 'emom') {
    completeEmomSet(targetReps);
  } else if (type === 'tabata') {
    completeTabataSet();
  } else {
    completeClassicSet(targetReps, autoAdvance, breakDuration);
  }
}
