// src/lib/components/Counter.test.ts
/** @vitest-environment jsdom */
import { render, fireEvent } from '@testing-library/svelte';
import Counter from './Counter.svelte';
import * as storeModule from '../store';
import { vi, describe, it, expect } from 'vitest';

vi.mock('svelte/transition', () => ({
  fade: () => ({ duration: 0 }),
  fly: () => ({ duration: 0 })
}));

vi.mock('../store', () => ({
  incrementRep: vi.fn(),
  manualAdvance: vi.fn(),
  sessionStore: {
    subscribe: (cb: any) => { 
      cb({ currentRep: 5, currentRound: 2, isResting: false }); 
      return () => {}; 
    }
  },
  settingsStore: {
    subscribe: (cb: any) => { 
      cb({ autoAdvance: false }); 
      return () => {}; 
    }
  }
}));

describe('Counter Component', () => {
  it('displays current rep and round', () => {
    const { getByText } = render(Counter, { 
      targetReps: 10, 
      restDuration: 30,
      onUpdateTarget: vi.fn(),
      onUpdateRest: vi.fn(),
      onOpenSettings: vi.fn() 
    });
    expect(getByText('5')).toBeTruthy();
    expect(getByText('Round 2')).toBeTruthy();
  });

  it('calls incrementRep on click', async () => {
    const { getByTestId } = render(Counter, { 
      targetReps: 10, 
      restDuration: 30,
      onUpdateTarget: vi.fn(),
      onUpdateRest: vi.fn(),
      onOpenSettings: vi.fn() 
    });
    const button = getByTestId('counter-area');
    await fireEvent.click(button);
    expect(storeModule.incrementRep).toHaveBeenCalledWith(10, false);
  });

  it('shows NEXT ROUND button when target is reached and autoAdvance is false', () => {
    const { getByText } = render(Counter, { 
      targetReps: 5, 
      restDuration: 30,
      onUpdateTarget: vi.fn(),
      onUpdateRest: vi.fn(),
      onOpenSettings: vi.fn() 
    });
    expect(getByText('NEXT ROUND')).toBeTruthy();
  });

  it('calls manualAdvance when NEXT ROUND button is clicked', async () => {
    const { getByText } = render(Counter, { 
      targetReps: 5, 
      restDuration: 30,
      onUpdateTarget: vi.fn(),
      onUpdateRest: vi.fn(),
      onOpenSettings: vi.fn() 
    });
    const nextButton = getByText('NEXT ROUND');
    await fireEvent.click(nextButton);
    expect(storeModule.manualAdvance).toHaveBeenCalled();
  });

  it('opens QuickAdjust when round or target text is clicked', async () => {
    const { getByText, queryByText } = render(Counter, { 
      targetReps: 10, 
      restDuration: 30,
      onUpdateTarget: vi.fn(),
      onUpdateRest: vi.fn(),
      onOpenSettings: vi.fn() 
    });
    
    // Initially QuickAdjust is not shown (we can check for "DONE" button or similar)
    expect(queryByText('DONE')).toBeNull();

    // Click on Round text
    const roundText = getByText('Round 2');
    await fireEvent.click(roundText);

    // Now QuickAdjust should be shown
    expect(getByText('DONE')).toBeTruthy();
  });
});
