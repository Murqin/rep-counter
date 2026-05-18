// src/lib/feedback.ts
import { get } from 'svelte/store';
import { settingsStore } from './store';

/**
 * Triggers a haptic feedback (vibration) if supported and enabled.
 * @param pattern Vibration pattern (e.g., 50ms for a short tap)
 */
export function vibrate(pattern: number | number[] = 50) {
  const settings = get(settingsStore);
  if (settings.enableFeedback && typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

/**
 * Plays a simple notification beep using Web Audio API.
 * @param frequency Frequency in Hz
 * @param duration Duration in seconds
 */
export function playSound(frequency: number = 440, duration: number = 0.1) {
  const settings = get(settingsStore);
  if (!settings.enableFeedback) return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context might be blocked or unsupported
  }
}

/**
 * Feedback for a single rep increment.
 */
export function feedbackRep() {
  vibrate(40);
  playSound(880, 0.05);
}

/**
 * Feedback for completing a round/set.
 */
export function feedbackSuccess() {
  vibrate([100, 50, 100]);
  playSound(1320, 0.2);
}
