// src/lib/types.ts
export type PresetType = 'classic' | 'emom' | 'tabata' | 'amrap';

export type Preset = {
  id: string;
  name: string;
  type?: PresetType; // Optional for backwards compatibility
  rounds: number;
  repsPerRound: number;
  breakDuration: number; // Rest duration for Classic/Tabata
  workDuration?: number; // Active duration for Tabata (default 20)
  emomInterval?: number; // Total interval duration for EMOM (default 60)
  amrapDuration?: number; // Total duration for AMRAP in seconds (default 600)
};

export type SessionState = {
  activePresetId: string | null;
  workoutType?: PresetType; // Tracks current session's workout type
  currentRound: number;
  currentRep: number;
  isResting: boolean;
  isTransitioning: boolean;
  totalRounds: number;
  timeLeft: number;
  lastTick: number | null;
  amrapRoundsCompleted?: number; // Completed rounds count for AMRAP
};

export type Settings = {
  autoAdvance: boolean;
  theme: 'dark' | 'light';
  enableFeedback: boolean;
  lang: 'en' | 'tr';
};
