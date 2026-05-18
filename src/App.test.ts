// src/App.test.ts
import { render, screen, act } from '@testing-library/svelte';
import App from './App.svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sessionStore, presetsStore } from './lib/store';

vi.mock('svelte/transition', () => ({
  fade: () => {},
  scale: () => {}
}));

describe('App Component Integration', () => {
  beforeEach(() => {
    sessionStore.set({
      activePresetId: null,
      currentRound: 1,
      currentRep: 0,
      isResting: false
    });
    presetsStore.set([]);
  });

  it('initializes default preset on mount', async () => {
    render(App);
    
    // Wait for onMount effects
    await act(() => {});
    
    expect(screen.getByText(/ROUND 1/i)).toBeTruthy();
    expect(screen.getByText(/TARGET 10/i)).toBeTruthy();
  });

  it('toggles between Counter and Timer based on isResting', async () => {
    render(App);
    
    // Initial state: Counter
    expect(screen.getByText(/ROUND 1/i)).toBeTruthy();
    
    // Switch to resting
    await act(() => {
      sessionStore.update(s => ({ ...s, isResting: true }));
    });
    
    expect(screen.getAllByText(/BREAK/i).length).toBeGreaterThan(0);
    
    // Switch back to counter
    await act(() => {
      sessionStore.update(s => ({ ...s, isResting: false }));
    });
    
    expect(screen.getByText(/ROUND 1/i)).toBeTruthy();
  });

  it('shows Success screen when session is complete', async () => {
    const testPreset = {
      id: 'test-preset',
      name: 'Test Preset',
      rounds: 3,
      repsPerRound: 5,
      breakDuration: 10
    };
    presetsStore.set([testPreset]);
    sessionStore.set({
      activePresetId: 'test-preset',
      currentRound: 4, // More than 3
      currentRep: 0,
      isResting: false
    });

    render(App);
    
    await act(() => {});
    
    expect(screen.getByText('Session Complete')).toBeTruthy();
  });
});
