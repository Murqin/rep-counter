import { render, fireEvent } from '@testing-library/svelte';
import Timer from '../../../src/lib/components/Timer.svelte';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tick } from 'svelte';
import { writable } from 'svelte/store';

// Mock the store entirely without using any imports inside the factory
vi.mock('../../../src/lib/store', () => {
  const mockStore = {
    subscribe: (fn: any) => {
      fn({
        activePresetId: null,
        currentRound: 1,
        currentRep: 0,
        isResting: true,
        totalRounds: 5,
        timeLeft: 60,
        lastTick: Date.now()
      });
      return () => {};
    },
    update: vi.fn(),
    set: vi.fn()
  };

  return {
    sessionStore: mockStore,
    endRest: vi.fn(),
    updateTimer: vi.fn()
  };
});

// Import them AFTER mocking
import { sessionStore, endRest } from '../../../src/lib/store';

describe('Timer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('renders correctly', async () => {
    // Since we mocked subscribe to return 60s, it should show 01:00
    const { getByText } = render(Timer, { duration: 60 });
    await tick();
    expect(getByText('01:00')).toBeTruthy();
  });

  it('calls endRest when SKIP BREAK button is clicked', async () => {
    const { getByText } = render(Timer, { duration: 60 });
    await tick();
    const skipButton = getByText('SKIP BREAK');
    await fireEvent.click(skipButton);
    expect(endRest).toHaveBeenCalled();
  });
});
