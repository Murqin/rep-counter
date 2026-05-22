import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Success from '../../../src/lib/components/Success.svelte';
import { sessionStore } from '../../../src/lib/store';
import { get } from 'svelte/store';

vi.mock('svelte/transition', () => ({
  fade: () => {},
  scale: () => {}
}));

describe('Success Component', () => {
  it('renders completion message', () => {
    const { getByText } = render(Success, { onMenu: () => {} });
    expect(getByText('Session Complete')).toBeTruthy();
    expect(getByText("You've reached your goal")).toBeTruthy();
  });

  it('calls onMenu when BACK TO MENU is clicked', async () => {
    const onMenu = vi.fn();
    const { getByText } = render(Success, { onMenu });
    
    const menuButton = getByText('BACK TO MENU');
    await fireEvent.click(menuButton);
    
    expect(onMenu).toHaveBeenCalled();
  });

  it('resets session when RESTART PRESET is clicked', async () => {
    sessionStore.set({
      activePresetId: 'test',
      currentRound: 5,
      currentRep: 10,
      isResting: true,
      totalRounds: 5,
      timeLeft: 0,
      lastTick: null
    });

    const { getByText } = render(Success, { onMenu: () => {} });
    
    const restartButton = getByText('RESTART PRESET');
    await fireEvent.click(restartButton);
    
    const state = get(sessionStore);
    expect(state.currentRound).toBe(1);
    expect(state.currentRep).toBe(0);
    expect(state.isResting).toBe(false);
  });

  it('renders AMRAP score controls and adjusts rounds and reps', async () => {
    sessionStore.set({
      activePresetId: 'test',
      workoutType: 'amrap',
      currentRound: 1000,
      currentRep: 5,
      isResting: false,
      isTransitioning: false,
      totalRounds: 999,
      timeLeft: 0,
      lastTick: null,
      amrapRoundsCompleted: 12
    });

    const { getByLabelText, getByText } = render(Success, { onMenu: () => {} });

    // Rounds increase
    const incRounds = getByLabelText('Increase Rounds');
    await fireEvent.click(incRounds);
    expect(get(sessionStore).amrapRoundsCompleted).toBe(13);

    // Rounds decrease
    const decRounds = getByLabelText('Decrease Rounds');
    await fireEvent.click(decRounds);
    expect(get(sessionStore).amrapRoundsCompleted).toBe(12);

    // Reps increase
    const incReps = getByLabelText('Increase Reps');
    await fireEvent.click(incReps);
    expect(get(sessionStore).currentRep).toBe(6);

    // Reps decrease
    const decReps = getByLabelText('Decrease Reps');
    await fireEvent.click(decReps);
    expect(get(sessionStore).currentRep).toBe(5);
  });

  it('renders Tabata score controls and adjusts total reps', async () => {
    sessionStore.set({
      activePresetId: 'test',
      workoutType: 'tabata',
      currentRound: 9,
      currentRep: 42,
      isResting: false,
      isTransitioning: false,
      totalRounds: 8,
      timeLeft: 0,
      lastTick: null
    });

    const { getByLabelText } = render(Success, { onMenu: () => {} });

    // Reps increase
    const incReps = getByLabelText('Increase Reps');
    await fireEvent.click(incReps);
    expect(get(sessionStore).currentRep).toBe(43);

    // Reps decrease
    const decReps = getByLabelText('Decrease Reps');
    await fireEvent.click(decReps);
    expect(get(sessionStore).currentRep).toBe(42);
  });

  it('prevents negative rounds and reps', async () => {
    sessionStore.set({
      activePresetId: 'test',
      workoutType: 'amrap',
      currentRound: 1000,
      currentRep: 0,
      isResting: false,
      isTransitioning: false,
      totalRounds: 999,
      timeLeft: 0,
      lastTick: null,
      amrapRoundsCompleted: 0
    });

    const { getByLabelText } = render(Success, { onMenu: () => {} });

    // Try to decrease rounds below 0
    const decRounds = getByLabelText('Decrease Rounds');
    await fireEvent.click(decRounds);
    expect(get(sessionStore).amrapRoundsCompleted).toBe(0);

    // Try to decrease reps below 0
    const decReps = getByLabelText('Decrease Reps');
    await fireEvent.click(decReps);
    expect(get(sessionStore).currentRep).toBe(0);
  });
});
