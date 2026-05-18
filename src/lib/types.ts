// src/lib/types.ts
export type Preset = {
  id: string;
  name: string;
  rounds: number;
  repsPerRound: number;
  breakDuration: number;
};

export type SessionState = {
  activePresetId: string | null;
  currentRound: number;
  currentRep: number;
  isResting: boolean;
  totalRounds: number;
};

export type Settings = {
  autoAdvance: boolean;
};
