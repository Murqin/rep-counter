/** @vitest-environment jsdom */
import { render, fireEvent } from '@testing-library/svelte';
import QuickAdjust from './QuickAdjust.svelte';
import { sessionStore } from '../store';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';

vi.mock('svelte/transition', () => ({
  fade: () => ({ duration: 0 }),
  fly: () => ({ duration: 0 })
}));

describe('QuickAdjust Component', () => {
  beforeEach(() => {
    sessionStore.set({
      activePresetId: '1',
      currentRound: 1,
      currentRep: 0,
      isResting: false,
      totalRounds: 5
    });
  });

  it('renders correctly with targetReps and totalRounds', () => {
    const { getByText } = render(QuickAdjust, { 
      onclose: vi.fn(), 
      targetReps: 10, 
      onUpdateTarget: vi.fn() 
    });

    expect(getByText('10')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });

  it('calls onUpdateTarget when target reps buttons are clicked', async () => {
    const onUpdateTarget = vi.fn();
    const { getAllByText } = render(QuickAdjust, { 
      onclose: vi.fn(), 
      targetReps: 10, 
      onUpdateTarget 
    });

    const plusButtons = getAllByText('+');
    const minusButtons = getAllByText('−');

    // Target Reps plus is the first '+' button
    await fireEvent.click(plusButtons[0]);
    expect(onUpdateTarget).toHaveBeenCalledWith(11);

    await fireEvent.click(minusButtons[0]);
    expect(onUpdateTarget).toHaveBeenCalledWith(9);
  });

  it('updates sessionStore totalRounds when round buttons are clicked', async () => {
    const { getAllByText } = render(QuickAdjust, { 
      onclose: vi.fn(), 
      targetReps: 10, 
      onUpdateTarget: vi.fn() 
    });

    const plusButtons = getAllByText('+');
    const minusButtons = getAllByText('−');

    // Total Rounds plus is the second '+' button
    await fireEvent.click(plusButtons[1]);
    expect(get(sessionStore).totalRounds).toBe(6);

    await fireEvent.click(minusButtons[1]);
    expect(get(sessionStore).totalRounds).toBe(5);
  });

  it('calls onclose when DONE button is clicked', async () => {
    const onclose = vi.fn();
    const { getByText } = render(QuickAdjust, { 
      onclose, 
      targetReps: 10, 
      onUpdateTarget: vi.fn() 
    });

    const doneButton = getByText('DONE');
    await fireEvent.click(doneButton);
    expect(onclose).toHaveBeenCalled();
  });
});
