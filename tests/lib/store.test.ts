import { get } from 'svelte/store';
import { sessionStore, incrementRep, manualAdvance, endRest, completeSet, persistentWritable } from '../../src/lib/store';
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

describe('Store Logic', () => {
  beforeEach(() => {
    sessionStore.set({
      activePresetId: '1',
      currentRound: 1,
      currentRep: 0,
      isResting: false,
      isTransitioning: false,
      totalRounds: 3,
      timeLeft: 0,
      lastTick: null
    });
  });

  it('incrementRep increases rep count', () => {
    incrementRep(10, false, 30); // target reps = 10, autoAdvance = false, breakDuration = 30
    expect(get(sessionStore).currentRep).toBe(1);
  });

  it('incrementRep does not increase rep count while resting', () => {
    sessionStore.set({ activePresetId: '1', currentRound: 1, currentRep: 0, isResting: true, isTransitioning: false, totalRounds: 3, timeLeft: 30, lastTick: Date.now() });
    incrementRep(10, false, 30);
    expect(get(sessionStore).currentRep).toBe(0);
  });
  
  it('incrementRep handles manual round completion without auto advance', () => {
    sessionStore.set({ activePresetId: '1', currentRound: 1, currentRep: 9, isResting: false, isTransitioning: false, totalRounds: 3, timeLeft: 0, lastTick: null });
    incrementRep(10, false, 30);
    expect(get(sessionStore).currentRep).toBe(10);
    expect(get(sessionStore).currentRound).toBe(1); // Should not advance yet
  });

  it('incrementRep handles auto advance', () => {
    sessionStore.set({ activePresetId: '1', currentRound: 1, currentRep: 9, isResting: false, isTransitioning: false, totalRounds: 3, timeLeft: 0, lastTick: null });
    incrementRep(10, true, 30);
    expect(get(sessionStore).currentRep).toBe(0);
    expect(get(sessionStore).currentRound).toBe(2);
    expect(get(sessionStore).isResting).toBe(true);
    expect(get(sessionStore).timeLeft).toBe(30);
  });

  it('incrementRep does not set isResting on last round completion', () => {
    // Current round 3 of 3. Completing reps should increment round to 4 and NOT set resting.
    sessionStore.set({ activePresetId: '1', currentRound: 3, currentRep: 9, isResting: false, isTransitioning: false, totalRounds: 3, timeLeft: 0, lastTick: null });
    incrementRep(10, true, 30);
    expect(get(sessionStore).currentRound).toBe(4);
    expect(get(sessionStore).isResting).toBe(false);
  });

  it('manualAdvance advances to next round and starts resting', () => {
    sessionStore.set({ activePresetId: '1', currentRound: 1, currentRep: 10, isResting: false, isTransitioning: false, totalRounds: 3, timeLeft: 0, lastTick: null });
    manualAdvance(30);
    expect(get(sessionStore).currentRep).toBe(0);
    expect(get(sessionStore).currentRound).toBe(2);
    expect(get(sessionStore).isResting).toBe(true);
    expect(get(sessionStore).timeLeft).toBe(30);
  });

  it('completeSet advances to next round and starts resting when autoAdvance is true', () => {
    sessionStore.set({ activePresetId: '1', currentRound: 1, currentRep: 0, isResting: false, isTransitioning: false, totalRounds: 5, timeLeft: 0, lastTick: null });
    completeSet(10, true, 30);
    const state = get(sessionStore);
    expect(state.currentRep).toBe(0);
    expect(state.currentRound).toBe(2);
    expect(state.isResting).toBe(true);
    expect(state.timeLeft).toBe(30);
  });

  it('completeSet sets reps to target and does not advance round when autoAdvance is false', () => {
    sessionStore.set({ activePresetId: '1', currentRound: 1, currentRep: 0, isResting: false, isTransitioning: false, totalRounds: 5, timeLeft: 0, lastTick: null });
    completeSet(10, false, 30);
    const state = get(sessionStore);
    expect(state.currentRep).toBe(10);
    expect(state.currentRound).toBe(1);
    expect(state.isResting).toBe(false);
  });

  it('endRest sets isResting to false', () => {
    sessionStore.set({ activePresetId: '1', currentRound: 2, currentRep: 0, isResting: true, isTransitioning: false, totalRounds: 3, timeLeft: 15, lastTick: Date.now() });
    endRest();
    expect(get(sessionStore).isResting).toBe(false);
  });
});