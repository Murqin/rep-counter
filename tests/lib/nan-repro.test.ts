import { get } from 'svelte/store';
import { sessionStore } from '../../src/lib/store';
import { describe, it, expect, beforeEach } from 'vitest';

describe('NaN Reproduction', () => {
  beforeEach(() => {
    sessionStore.set({
      activePresetId: null,
      currentRound: 1,
      currentRep: 0,
      isResting: false,
      totalRounds: 3,
      timeLeft: 0,
      lastTick: null
    });
  });

  it('sessionStore.update with addition should not result in NaN if input is number', () => {
    sessionStore.update(s => ({ ...s, totalRounds: s.totalRounds + 1 }));
    expect(get(sessionStore).totalRounds).toBe(4);
  });

  it('sessionStore.update might result in NaN if current value is somehow NaN', () => {
    // @ts-ignore
    sessionStore.update(s => ({ ...s, totalRounds: NaN }));
    sessionStore.update(s => ({ ...s, totalRounds: s.totalRounds + 1 }));
    expect(get(sessionStore).totalRounds).toBeNaN();
  });
});
