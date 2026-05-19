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
});
