# Design Spec: Set Completion Feature
**Date:** 2024-05-22
**Status:** Approved

## Goal
Improve usability for high-rep sessions by allowing users to mark a full set as complete with a single action, avoiding the need for repetitive tapping.

## Features

### 1. "Finish Set" Button
- **UI:** A secondary action button in the `Counter` component, positioned below the main rep display.
- **Visuals:** Minimalist, semi-transparent border/text that becomes more prominent as the user approaches the target, or always visible but subtle.
- **Label:** "FINISH SET" or a Checkmark icon.

### 2. Bulk Increment Logic
- **Functionality:** When triggered, the `currentRep` value is immediately set to the `targetReps` value.
- **Workflow Integration:** This trigger will then call the existing `incrementRep` or similar logic to handle the transition to the next state (Resting or Session Success).

## Technical Changes
- **Store Updates:** 
    - Add a `completeSet(targetReps: number, autoAdvance: boolean)` function to `src/lib/store.ts`.
- **Components:**
    - Update `src/lib/components/Counter.svelte` to include the new button.
    - Add logic to show/hide the button based on a threshold (optional, default to always visible for now).

## Future Handover Note
Ensure the button doesn't clutter the main circular click area. It should feel like a "shortcut" for experienced users.
