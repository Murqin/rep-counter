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
      totalRounds: 5,
      timeLeft: 0,
      lastTick: null
    });
  });

  it('renders correctly with targetReps and totalRounds', () => {
    const { getByText } = render(QuickAdjust, { 
      onclose: vi.fn(), 
      targetReps: 10, 
      onUpdateTarget: vi.fn(),
      restDuration: 30,
      onUpdateRest: vi.fn()
    });

    expect(getByText('10')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });

  it('calls onUpdateTarget when target reps buttons are clicked', async () => {
    const onUpdateTarget = vi.fn();
    const { getAllByText } = render(QuickAdjust, { 
      onclose: vi.fn(), 
      targetReps: 10, 
      onUpdateTarget,
      restDuration: 30,
      onUpdateRest: vi.fn()
    });

    const plusButtons = getAllByText('+');
    const minusButtons = getAllByText('−');

    // Target Reps plus is the first '+' button
    await fireEvent.click(plusButtons[0]);
    expect(onUpdateTarget).toHaveBeenCalledWith(11);

    await fireEvent.click(minusButtons[0]);
    expect(onUpdateTarget).toHaveBeenCalledWith(9);
  });

  it('calls onUpdateRest when break time buttons are clicked', async () => {
    const onUpdateRest = vi.fn();
    const { getAllByText } = render(QuickAdjust, { 
      onclose: vi.fn(), 
      targetReps: 10, 
      onUpdateTarget: vi.fn(),
      restDuration: 30,
      onUpdateRest
    });

    const plusButtons = getAllByText('+');
    const minusButtons = getAllByText('−');

    // Break Time plus is the second '+' button
    await fireEvent.click(plusButtons[1]);
    expect(onUpdateRest).toHaveBeenCalledWith(35);

    await fireEvent.click(minusButtons[1]);
    expect(onUpdateRest).toHaveBeenCalledWith(25);
  });

  it('updates sessionStore totalRounds when round buttons are clicked', async () => {
    const { getAllByText } = render(QuickAdjust, { 
      onclose: vi.fn(), 
      targetReps: 10, 
      onUpdateTarget: vi.fn(),
      restDuration: 30,
      onUpdateRest: vi.fn()
    });

    const plusButtons = getAllByText('+');
    const minusButtons = getAllByText('−');

    // Total Rounds plus is the third '+' button
    await fireEvent.click(plusButtons[2]);
    expect(get(sessionStore).totalRounds).toBe(6);

    await fireEvent.click(minusButtons[2]);
    expect(get(sessionStore).totalRounds).toBe(5);
  });

  it('calls onclose when DONE button is clicked', async () => {
    const onclose = vi.fn();
    const { getByText } = render(QuickAdjust, { 
      onclose, 
      targetReps: 10, 
      onUpdateTarget: vi.fn(),
      restDuration: 30,
      onUpdateRest: vi.fn()
    });

    const doneButton = getByText('DONE');
    await fireEvent.click(doneButton);
    expect(onclose).toHaveBeenCalled();
  });
});
