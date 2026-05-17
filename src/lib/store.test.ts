import { get } from 'svelte/store';
import { sessionStore, incrementRep, manualAdvance, endRest } from './store';

describe('Store Logic', () => {
  beforeEach(() => {
    sessionStore.set({
      activePresetId: '1',
      currentRound: 1,
      currentRep: 0,
      isResting: false
    });
  });

  it('incrementRep increases rep count', () => {
    incrementRep(10, false); // target reps = 10, autoAdvance = false
    expect(get(sessionStore).currentRep).toBe(1);
  });
  
  it('incrementRep handles manual round completion without auto advance', () => {
    sessionStore.set({ activePresetId: '1', currentRound: 1, currentRep: 9, isResting: false });
    incrementRep(10, false);
    expect(get(sessionStore).currentRep).toBe(10);
    expect(get(sessionStore).currentRound).toBe(1); // Should not advance yet
  });

  it('incrementRep handles auto advance', () => {
    sessionStore.set({ activePresetId: '1', currentRound: 1, currentRep: 9, isResting: false });
    incrementRep(10, true);
    expect(get(sessionStore).currentRep).toBe(0);
    expect(get(sessionStore).currentRound).toBe(2);
    expect(get(sessionStore).isResting).toBe(true);
  });
});
