import { render, fireEvent } from '@testing-library/svelte';
import Timer from './Timer.svelte';
import * as storeModule from '../store';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tick } from 'svelte';

vi.mock('../store', () => ({
  endRest: vi.fn()
}));

describe('Timer Component', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('renders initial duration correctly', () => {
    const { getByText } = render(Timer, { duration: 120 });
    expect(getByText('02:00')).toBeTruthy();
  });

  it('counts down and calls endRest when finished', async () => {
    const { getByText } = render(Timer, { duration: 2 });
    expect(getByText('00:02')).toBeTruthy();

    vi.advanceTimersByTime(1000);
    await tick();
    expect(getByText('00:01')).toBeTruthy();

    vi.advanceTimersByTime(1000);
    await tick();
    expect(storeModule.endRest).toHaveBeenCalled();
  });

  it('calls endRest when SKIP BREAK button is clicked', async () => {
    const { getByText } = render(Timer, { duration: 60 });
    const skipButton = getByText('SKIP BREAK');
    await fireEvent.click(skipButton);
    expect(storeModule.endRest).toHaveBeenCalled();
  });
});
