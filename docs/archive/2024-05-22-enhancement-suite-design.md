# Design Spec: Rep Counter Enhancement Suite
**Date:** 2024-05-22
**Status:** Approved

## Goal
Transform the minimalist Rep Counter into a production-ready mobile PWA with professional session flow controls, editing capabilities, and hardware integration (Wake Lock).

## Features

### 1. Session Completion Flow
- **Trigger:** When `currentRound` exceeds the total rounds defined in the active preset.
- **UI:** A success screen replacing the `Counter` component.
- **Data:** Displays summary (e.g., "50 Reps in 5 Rounds").
- **Actions:** 
    - `Restart`: Resets session to Round 1, Rep 0 of the same preset.
    - `Menu`: Resets session and opens `PresetManager`.

### 2. Quick Adjust (Mobile-Focused)
- **UI:** Clicking on the "Target" or "Round" text in the Counter triggers a bottom drawer.
- **Controls:** Large +/- buttons for immediate adjustment of the current session's targets without permanently altering the preset.

### 3. Preset Editing
- **UI:** Add an edit (pencil) icon to each preset row in `PresetManager`.
- **Functionality:** Populates the creation form with existing preset data; "Create" button changes to "Save Changes".

### 4. Screen Stay Awake
- **API:** [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API).
- **Behavior:** Request lock on component mount (`App.svelte`), release on unmount or visibility change.

## Technical Changes
- **Store Updates:** 
    - Add `totalRounds` to `SessionState` (derived from preset but adjustable).
    - Update `incrementRep` to check for session completion.
- **Components:**
    - New `Success.svelte` component.
    - New `QuickAdjust.svelte` (Bottom Sheet) component.
    - Refactor `PresetManager.svelte` to handle "Edit Mode".
- **Hardware:** Add a `wakeLock.ts` utility.

## Future Handover Note
All UI should maintain the AMOLED-black (0,0,0) background and white/gray text theme. Interaction must be optimized for thumb reach (bottom-heavy controls).
