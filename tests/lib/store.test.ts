import { get } from 'svelte/store';
import { 
  sessionStore, 
  presetsStore, 
  incrementRep, 
  manualAdvance, 
  endRest, 
  completeSet, 
  persistentWritable,
  handleTimerExpiry
} from '../../src/lib/store';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('persistentWritable', () => {
  let localStorageMock: any;

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
    vi.stubGlobal('localStorage', localStorageMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('initializes with initialValue when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const store = persistentWritable('test-key', 'default');
    expect(get(store)).toBe('default');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('initializes with parsed value from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('stored-value'));
    const store = persistentWritable('test-key', 'default');
    expect(get(store)).toBe('stored-value');
  });

  it('falls back to initialValue on corrupted localStorage data', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');
    const store = persistentWritable('test-key', 'default');
    expect(get(store)).toBe('default');
  });

  it('writes to localStorage on update', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const store = persistentWritable('test-key', 'default');
    store.set('new-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });
});

describe('Store Logic - Classic', () => {
  beforeEach(() => {
    presetsStore.set([
      {
        id: '1',
        name: 'Quick Start',
        type: 'classic',
        rounds: 3,
        repsPerRound: 10,
        breakDuration: 30
      }
    ]);
    sessionStore.set({
      activePresetId: '1',
      workoutType: 'classic',
      currentRound: 1,
      currentRep: 0,
      isResting: false,
      isTransitioning: false,
      totalRounds: 3,
      timeLeft: 0,
      lastTick: null,
      amrapRoundsCompleted: 0
    });
  });

  it('incrementRep increases rep count', () => {
    incrementRep(10, false, 30); // target reps = 10, autoAdvance = false, breakDuration = 30
    expect(get(sessionStore).currentRep).toBe(1);
  });

  it('incrementRep does not increase rep count while resting', () => {
    sessionStore.set({ activePresetId: '1', workoutType: 'classic', currentRound: 1, currentRep: 0, isResting: true, isTransitioning: false, totalRounds: 3, timeLeft: 30, lastTick: Date.now() });
    incrementRep(10, false, 30);
    expect(get(sessionStore).currentRep).toBe(0);
  });
  
  it('incrementRep handles manual round completion without auto advance', () => {
    sessionStore.set({ activePresetId: '1', workoutType: 'classic', currentRound: 1, currentRep: 9, isResting: false, isTransitioning: false, totalRounds: 3, timeLeft: 0, lastTick: null });
    incrementRep(10, false, 30);
    expect(get(sessionStore).currentRep).toBe(10);
    expect(get(sessionStore).currentRound).toBe(1); // Should not advance yet
  });

  it('incrementRep handles auto advance', () => {
    sessionStore.set({ activePresetId: '1', workoutType: 'classic', currentRound: 1, currentRep: 9, isResting: false, isTransitioning: false, totalRounds: 3, timeLeft: 0, lastTick: null });
    incrementRep(10, true, 30);
    expect(get(sessionStore).currentRep).toBe(0);
    expect(get(sessionStore).currentRound).toBe(2);
    expect(get(sessionStore).isResting).toBe(true);
    expect(get(sessionStore).timeLeft).toBe(30);
  });

  it('incrementRep does not set isResting on last round completion', () => {
    // Current round 3 of 3. Completing reps should increment round to 4 and NOT set resting.
    sessionStore.set({ activePresetId: '1', workoutType: 'classic', currentRound: 3, currentRep: 9, isResting: false, isTransitioning: false, totalRounds: 3, timeLeft: 0, lastTick: null });
    incrementRep(10, true, 30);
    expect(get(sessionStore).currentRound).toBe(4);
    expect(get(sessionStore).isResting).toBe(false);
  });

  it('manualAdvance advances to next round and starts resting', () => {
    sessionStore.set({ activePresetId: '1', workoutType: 'classic', currentRound: 1, currentRep: 10, isResting: false, isTransitioning: false, totalRounds: 3, timeLeft: 0, lastTick: null });
    manualAdvance(30);
    expect(get(sessionStore).currentRep).toBe(0);
    expect(get(sessionStore).currentRound).toBe(2);
    expect(get(sessionStore).isResting).toBe(true);
    expect(get(sessionStore).timeLeft).toBe(30);
  });

  it('manualAdvance on final round transitions to success without resting', () => {
    sessionStore.set({ activePresetId: '1', workoutType: 'classic', currentRound: 3, currentRep: 10, isResting: false, isTransitioning: false, totalRounds: 3, timeLeft: 0, lastTick: null });
    manualAdvance(30);
    const state = get(sessionStore);
    expect(state.isResting).toBe(false);
    expect(state.isTransitioning).toBe(true);
  });

  it('completeSet advances to next round and starts resting when autoAdvance is true', () => {
    sessionStore.set({ activePresetId: '1', workoutType: 'classic', currentRound: 1, currentRep: 0, isResting: false, isTransitioning: false, totalRounds: 5, timeLeft: 0, lastTick: null });
    completeSet(10, true, 30);
    const state = get(sessionStore);
    expect(state.currentRep).toBe(0);
    expect(state.currentRound).toBe(2);
    expect(state.isResting).toBe(true);
    expect(state.timeLeft).toBe(30);
  });

  it('completeSet sets reps to target and does not advance round when autoAdvance is false', () => {
    sessionStore.set({ activePresetId: '1', workoutType: 'classic', currentRound: 1, currentRep: 0, isResting: false, isTransitioning: false, totalRounds: 5, timeLeft: 0, lastTick: null });
    completeSet(10, false, 30);
    const state = get(sessionStore);
    expect(state.currentRep).toBe(10);
    expect(state.currentRound).toBe(1);
    expect(state.isResting).toBe(false);
  });

  it('endRest sets isResting to false', () => {
    sessionStore.set({ activePresetId: '1', workoutType: 'classic', currentRound: 2, currentRep: 0, isResting: true, isTransitioning: false, totalRounds: 3, timeLeft: 15, lastTick: Date.now() });
    endRest();
    expect(get(sessionStore).isResting).toBe(false);
  });
});

describe('Store Logic - EMOM', () => {
  beforeEach(() => {
    presetsStore.set([
      {
        id: 'emom-1',
        name: 'EMOM Power',
        type: 'emom',
        rounds: 3,
        repsPerRound: 8,
        breakDuration: 0,
        emomInterval: 60
      }
    ]);
  });

  it('incrementRep to target set triggers isResting = true without resetting timer', () => {
    sessionStore.set({
      activePresetId: 'emom-1',
      workoutType: 'emom',
      currentRound: 1,
      currentRep: 7,
      isResting: false,
      isTransitioning: false,
      totalRounds: 3,
      timeLeft: 42,
      lastTick: Date.now(),
      amrapRoundsCompleted: 0
    });

    incrementRep(8, true, 0);
    const state = get(sessionStore);
    expect(state.isResting).toBe(true);
    expect(state.currentRep).toBe(8);
    expect(state.timeLeft).toBe(42); // Time left should not be changed!
  });

  it('handleTimerExpiry in EMOM advances round and resets reps/resting state', () => {
    const startState = {
      activePresetId: 'emom-1',
      workoutType: 'emom' as const,
      currentRound: 1,
      currentRep: 8,
      isResting: true,
      isTransitioning: false,
      totalRounds: 3,
      timeLeft: 0,
      lastTick: null,
      amrapRoundsCompleted: 0
    };

    const nextState = handleTimerExpiry(startState);
    expect(nextState.currentRound).toBe(2);
    expect(nextState.currentRep).toBe(0);
    expect(nextState.isResting).toBe(false);
    expect(nextState.timeLeft).toBe(60); // Resets to emomInterval
  });

  it('handleTimerExpiry on final EMOM round increments currentRound and ends ticking', () => {
    const finalState = {
      activePresetId: 'emom-1',
      workoutType: 'emom' as const,
      currentRound: 3,
      currentRep: 8,
      isResting: true,
      isTransitioning: false,
      totalRounds: 3,
      timeLeft: 0,
      lastTick: null,
      amrapRoundsCompleted: 0
    };

    const nextState = handleTimerExpiry(finalState);
    expect(nextState.currentRound).toBe(4);
    expect(nextState.timeLeft).toBe(0);
    expect(nextState.lastTick).toBeNull();
  });

  it('incrementRep to target on final round triggers isTransitioning = true and not resting', () => {
    sessionStore.set({
      activePresetId: 'emom-1',
      workoutType: 'emom',
      currentRound: 3,
      currentRep: 7,
      isResting: false,
      isTransitioning: false,
      totalRounds: 3,
      timeLeft: 42,
      lastTick: Date.now(),
      amrapRoundsCompleted: 0
    });

    incrementRep(8, true, 0);
    const state = get(sessionStore);
    expect(state.isResting).toBe(false);
    expect(state.isTransitioning).toBe(true);
    expect(state.currentRep).toBe(8);
  });

  it('completeSet to target on final round triggers isTransitioning = true and not resting', () => {
    sessionStore.set({
      activePresetId: 'emom-1',
      workoutType: 'emom',
      currentRound: 3,
      currentRep: 2,
      isResting: false,
      isTransitioning: false,
      totalRounds: 3,
      timeLeft: 42,
      lastTick: Date.now(),
      amrapRoundsCompleted: 0
    });

    completeSet(8, true, 0);
    const state = get(sessionStore);
    expect(state.isResting).toBe(false);
    expect(state.isTransitioning).toBe(true);
    expect(state.currentRep).toBe(8);
  });
});

describe('Store Logic - Tabata', () => {
  beforeEach(() => {
    presetsStore.set([
      {
        id: 'tabata-1',
        name: 'Tabata Burn',
        type: 'tabata',
        rounds: 4,
        repsPerRound: 0,
        breakDuration: 10,
        workDuration: 20
      }
    ]);
  });

  it('handleTimerExpiry from Work to Rest switches isResting and sets breakDuration', () => {
    const workState = {
      activePresetId: 'tabata-1',
      workoutType: 'tabata' as const,
      currentRound: 1,
      currentRep: 12,
      isResting: false,
      isTransitioning: false,
      totalRounds: 4,
      timeLeft: 0,
      lastTick: null,
      amrapRoundsCompleted: 0
    };

    const nextState = handleTimerExpiry(workState);
    expect(nextState.isResting).toBe(true);
    expect(nextState.timeLeft).toBe(10); // breakDuration
    expect(nextState.currentRound).toBe(1); // Still on round 1 until rest ends
  });

  it('handleTimerExpiry from Rest to Work increments round and sets workDuration', () => {
    const restState = {
      activePresetId: 'tabata-1',
      workoutType: 'tabata' as const,
      currentRound: 1,
      currentRep: 12,
      isResting: true,
      isTransitioning: false,
      totalRounds: 4,
      timeLeft: 0,
      lastTick: null,
      amrapRoundsCompleted: 0
    };

    const nextState = handleTimerExpiry(restState);
    expect(nextState.isResting).toBe(false);
    expect(nextState.currentRound).toBe(2);
    expect(nextState.currentRep).toBe(0); // Reps reset for next round
    expect(nextState.timeLeft).toBe(20); // workDuration
  });

  it('handleTimerExpiry from Rest to Work on last round terminates session', () => {
    const finalRestState = {
      activePresetId: 'tabata-1',
      workoutType: 'tabata' as const,
      currentRound: 4,
      currentRep: 10,
      isResting: true,
      isTransitioning: false,
      totalRounds: 4,
      timeLeft: 0,
      lastTick: null,
      amrapRoundsCompleted: 0
    };

    const nextState = handleTimerExpiry(finalRestState);
    expect(nextState.currentRound).toBe(5); // Finishes session
    expect(nextState.timeLeft).toBe(0);
    expect(nextState.lastTick).toBeNull();
  });
});

describe('Store Logic - AMRAP', () => {
  beforeEach(() => {
    presetsStore.set([
      {
        id: 'amrap-1',
        name: 'AMRAP Challenge',
        type: 'amrap',
        rounds: 999,
        repsPerRound: 5,
        breakDuration: 0,
        amrapDuration: 300
      }
    ]);
  });

  it('incrementRep to target auto-advances roundsCompleted and resets currentRep without rest', () => {
    sessionStore.set({
      activePresetId: 'amrap-1',
      workoutType: 'amrap',
      currentRound: 1,
      currentRep: 4,
      isResting: false,
      isTransitioning: false,
      totalRounds: 999,
      timeLeft: 220,
      lastTick: Date.now(),
      amrapRoundsCompleted: 2
    });

    incrementRep(5, true, 0);
    const state = get(sessionStore);
    expect(state.currentRep).toBe(0);
    expect(state.currentRound).toBe(2);
    expect(state.amrapRoundsCompleted).toBe(3);
    expect(state.isResting).toBe(false);
  });

  it('completeSet in AMRAP immediately increments roundsCompleted', () => {
    sessionStore.set({
      activePresetId: 'amrap-1',
      workoutType: 'amrap',
      currentRound: 2,
      currentRep: 3,
      isResting: false,
      isTransitioning: false,
      totalRounds: 999,
      timeLeft: 180,
      lastTick: Date.now(),
      amrapRoundsCompleted: 1
    });

    completeSet(5, true, 0);
    const state = get(sessionStore);
    expect(state.currentRep).toBe(0);
    expect(state.currentRound).toBe(3);
    expect(state.amrapRoundsCompleted).toBe(2);
  });

  it('handleTimerExpiry ends session by moving round beyond totalRounds', () => {
    const expiredState = {
      activePresetId: 'amrap-1',
      workoutType: 'amrap' as const,
      currentRound: 10,
      currentRep: 2,
      isResting: false,
      isTransitioning: false,
      totalRounds: 999,
      timeLeft: 0,
      lastTick: null,
      amrapRoundsCompleted: 9
    };

    const nextState = handleTimerExpiry(expiredState);
    expect(nextState.currentRound).toBe(1000); // 999 + 1
    expect(nextState.timeLeft).toBe(0);
  });
});