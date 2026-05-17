// src/lib/types.test.ts
import { describe, it, expect } from 'vitest';
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
});
