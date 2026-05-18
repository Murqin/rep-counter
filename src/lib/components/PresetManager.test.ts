/** @vitest-environment jsdom */
import { render, fireEvent } from '@testing-library/svelte';
import PresetManager from './PresetManager.svelte';
import { presetsStore, sessionStore } from '../store';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('PresetManager Component', () => {
  beforeEach(() => {
    // Mock element.animate for Svelte transitions in JSDOM
    if (!Element.prototype.animate) {
      Element.prototype.animate = vi.fn().mockImplementation(() => ({
        finished: Promise.resolve(),
        cancel: vi.fn(),
        pause: vi.fn(),
        play: vi.fn(),
        reverse: vi.fn(),
        onfinish: null,
        oncancel: null,
        currentTime: 0,
        effect: null,
        id: '',
        pending: false,
        playState: 'finished',
        playbackRate: 1,
        startTime: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      } as unknown as Animation));
    }

    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }

    presetsStore.set([{ id: '1', name: 'Test', rounds: 3, repsPerRound: 5, breakDuration: 10 }]);
    sessionStore.set({ activePresetId: '1', currentRound: 1, currentRep: 0, isResting: false, totalRounds: 3 });
  });

  it('renders existing presets', () => {
    const { getByText } = render(PresetManager, { onclose: vi.fn() });
    expect(getByText('Test')).toBeTruthy();
    expect(getByText('3 rounds • 5 reps • 10s break')).toBeTruthy();
  });

  it('allows adding a new preset', async () => {
    const { getByLabelText, getByText } = render(PresetManager, { onclose: vi.fn() });
    
    const nameInput = getByLabelText('Name');
    await fireEvent.input(nameInput, { target: { value: 'New Session' } });
    
    const createButton = getByText('Create Preset');
    await fireEvent.click(createButton);
    
    expect(getByText('New Session')).toBeTruthy();
  });

  it('calls onclose when close button is clicked', async () => {
    const onclose = vi.fn();
    const { getByLabelText } = render(PresetManager, { onclose });
    
    const closeButton = getByLabelText('Close');
    await fireEvent.click(closeButton);
    
    expect(onclose).toHaveBeenCalled();
  });

  it('selects a preset when clicked', async () => {
    const onclose = vi.fn();
    presetsStore.set([
      { id: '1', name: 'Test 1', rounds: 3, repsPerRound: 5, breakDuration: 10 },
      { id: '2', name: 'Test 2', rounds: 5, repsPerRound: 10, breakDuration: 20 }
    ]);
    const { getByText } = render(PresetManager, { onclose });
    
    const preset2 = getByText('Test 2');
    await fireEvent.click(preset2);
    
    let currentSession: any;
    sessionStore.subscribe(s => currentSession = s)();
    expect(currentSession.activePresetId).toBe('2');
    expect(onclose).toHaveBeenCalled();
  });

  it('enters edit mode when edit button is clicked', async () => {
    const { getByLabelText, getByDisplayValue } = render(PresetManager, { onclose: vi.fn() });
    
    const editButton = getByLabelText('Edit preset');
    await fireEvent.click(editButton);
    
    expect(getByDisplayValue('Test')).toBeTruthy();
    expect(getByDisplayValue('3')).toBeTruthy();
    expect(getByDisplayValue('5')).toBeTruthy();
    expect(getByDisplayValue('10')).toBeTruthy();
  });

  it('saves changes when editing a preset', async () => {
    const { getByLabelText, getByText, getByDisplayValue } = render(PresetManager, { onclose: vi.fn() });
    
    const editButton = getByLabelText('Edit preset');
    await fireEvent.click(editButton);
    
    const nameInput = getByLabelText('Name');
    await fireEvent.input(nameInput, { target: { value: 'Updated Test' } });
    
    const saveButton = getByText('Save Changes');
    await fireEvent.click(saveButton);
    
    expect(getByText('Updated Test')).toBeTruthy();
    
    let currentPresets: any;
    presetsStore.subscribe(p => currentPresets = p)();
    expect(currentPresets[0].name).toBe('Updated Test');
  });

  it('cancels editing when Cancel Edit button is clicked', async () => {
    const { getByLabelText, getByText, queryByText, getByDisplayValue } = render(PresetManager, { onclose: vi.fn() });
    
    const editButton = getByLabelText('Edit preset');
    await fireEvent.click(editButton);
    
    expect(getByText('Cancel Edit')).toBeTruthy();
    
    const cancelButton = getByText('Cancel Edit');
    await fireEvent.click(cancelButton);
    
    expect(queryByText('Cancel Edit')).toBeNull();
    expect(getByText('Create Preset')).toBeTruthy();
  });
});
