# Implementation Plan: Theme, Social & Feedback

**Goal:** Implement Light Mode, a Support/GitHub section, and Sound/Haptic feedback.

---

### Task 1: Theme & Social Support (Settings Update)

**Files:**
- Modify: `src/lib/types.ts` (Add `theme` and `feedback` to Settings)
- Modify: `src/lib/store.ts` (Update `settingsStore` defaults)
- Modify: `src/lib/components/PresetManager.svelte` (Add UI for Theme toggle and Social links)

- [ ] **Step 1: Update Types & Store**
  Add `theme: 'dark' | 'light'` and `enableFeedback: boolean` to `Settings` type and store.
- [ ] **Step 2: Add UI to PresetManager**
  Add a "Theme" toggle and a "Support & Community" section with GitHub link.

---

### Task 2: Audio & Haptic Feedback

**Files:**
- Create: `src/lib/feedback.ts` (Utility for sound and vibration)
- Modify: `src/lib/components/Counter.svelte` (Trigger feedback on rep/finish)
- Modify: `src/lib/components/Timer.svelte` (Trigger feedback on completion)

- [ ] **Step 1: Create Feedback Utility**
  Use `navigator.vibrate` and `Web Audio API` (Beep) for notifications.
- [ ] **Step 2: Integrate into Components**
  Trigger a short vibration/beep on rep increment and a longer one on round completion.

---

### Task 3: Light Mode Implementation (CSS)

**Files:**
- Modify: `src/app.css` (Add light mode variables/classes)
- Modify: `src/lib/components/*.svelte` (Ensure AMOLED-first components adapt to light mode)

- [ ] **Step 1: CSS Variables**
  Refactor hardcoded `#000000` to CSS variables that switch based on a `.light-mode` class on `body`.
- [ ] **Step 2: Component Polish**
  Ensure text colors and borders adjust correctly.

---

### Verification:
- [ ] Run `npm run check` and `npm test`.
- [ ] Verify light mode visual integrity.
- [ ] Confirm GitHub links work.
