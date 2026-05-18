import { render, fireEvent } from '@testing-library/svelte';
import Timer from './Timer.svelte';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tick } from 'svelte';
import { writable } from 'svelte/store';

// Define the mock object outside any variables to avoid hoisting issues
vi.mock('../store', () => {
  const sessionStore = writable({
    activePresetId: null,
    currentRound: 1,
    currentRep: 0,
    isResting: true,
    totalRounds: 5,
    timeLeft: 60,
    lastTick: Date.now()
  });

  return {
    sessionStore,
    endRest: vi.fn(),
    updateTimer: vi.fn()
  };
});

// Import the mocked store
import { sessionStore, endRest } from '../store';

describe('Timer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStore.set({
      activePresetId: null,
      currentRound: 1,
      currentRep: 0,
      isResting: true,
      totalRounds: 5,
      timeLeft: 60,
      lastTick: Date.now()
    });
  });
  afterEach(() => vi.useRealTimers());

  it('renders initial duration correctly', async () => {
    sessionStore.set({
      activePresetId: null,
      currentRound: 1,
      currentRep: 0,
      isResting: true,
      totalRounds: 5,
      timeLeft: 120,
      lastTick: Date.now()
    });
    const { getByText } = render(Timer, { duration: 120 });
    await tick();
    expect(getByText('02:00')).toBeTruthy();
  });

  it('counts down and calls endRest when finished', async () => {
    sessionStore.set({
      activePresetId: null,
      currentRound: 1,
      currentRep: 0,
      isResting: true,
      totalRounds: 5,
      timeLeft: 2,
      lastTick: Date.now()
    });
    const { getByText } = render(Timer, { duration: 2 });
    await tick();
    expect(getByText('00:02')).toBeTruthy();

    vi.advanceTimersByTime(1000);
    sessionStore.update(s => ({ ...s, timeLeft: 1 }));
    await tick();
    expect(getByText('00:01')).toBeTruthy();

    vi.advanceTimersByTime(1000);
    sessionStore.update(s => ({ ...s, timeLeft: 0 }));
    await tick();
    expect(endRest).toHaveBeenCalled();
  });

  it('calls endRest when SKIP BREAK button is clicked', async () => {
    const { getByText } = render(Timer, { duration: 60 });
    await tick();
    const skipButton = getByText('SKIP BREAK');
    await fireEvent.click(skipButton);
    expect(endRest).toHaveBeenCalled();
  });
});
