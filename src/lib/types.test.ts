// src/lib/types.test.ts
import type { Preset, SessionState, Settings } from './types';

describe('Types definition', () => {
  it('should allow creating a Preset object', () => {
    const preset: Preset = {
      id: '1',
      name: 'Task Practice',
      rounds: 5,
      repsPerRound: 10,
      breakDuration: 30
    };
    expect(preset.name).toBe('Task Practice');
  });

  it('should allow creating a SessionState object', () => {
    const sessionState: SessionState = {
      activePresetId: '1',
      currentRound: 1,
      currentRep: 0,
      isResting: false
    };
    expect(sessionState.activePresetId).toBe('1');
    expect(sessionState.currentRound).toBe(1);
    expect(sessionState.currentRep).toBe(0);
    expect(sessionState.isResting).toBe(false);
  });

  it('should allow creating a Settings object', () => {
    const settings: Settings = {
      autoAdvance: true
    };
    expect(settings.autoAdvance).toBe(true);
  });
});
