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
  isTransitioning: boolean;
  totalRounds: number;
  timeLeft: number;
  lastTick: number | null;
};

export type Settings = {
  autoAdvance: boolean;
  theme: 'dark' | 'light';
  enableFeedback: boolean;
  lang: 'en' | 'tr';
};
