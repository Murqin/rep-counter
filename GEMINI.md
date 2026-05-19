# Rep Counter: Project Instructions

## Tech Stack
- **Framework:** Svelte 5 (strictly using Runes like `$state`, `$derived`, `$effect`).
- **Styling:** Tailwind CSS v4 + Plain CSS Variables for theming.
- **State Management:** Svelte Stores with `localStorage` persistence.

## Architectural Mandates

### 1. Timer & Session Persistence
- **Smart Tick:** `sessionStore` tracks `timeLeft` and `lastTick` (Unix timestamp). `updateTimer()` calculates elapsed time since `lastTick` to survive refreshes.
- **Quick Overrides:** `overrideTargetReps` and `overrideBreakDuration` in `App.svelte` persist during session updates and only reset when a new preset ID is selected.

### 2. Theming Strategy
- **AMOLED First:** Default background is `#000000`.
- **Implementation:** Use CSS variables (`--bg-color`, `--text-color`, etc.) in `src/app.css`.
- **Switching:** Toggling theme toggles `.light` class on `document.documentElement`. Use `var(--var-name)` for all theme-sensitive colors.

### 3. UI/UX Standards
- **Centering:** Use `flex items-center justify-center` on the main container. Modals use `items-start` with top padding to prevent header cutoff on small screens.
- **Scaling:** Circular areas use `min(85vw, 65vh)` to ensure fit on all screen aspect ratios.
- **Transitions:** Use `isTransitioning` state in `sessionStore` to provide a 600ms visual pause when completing rounds with 0s rest.
- **Accessibility:** Minimum hitbox 44x44px. Use semantic `<button>`.

## File Structure
- **/src:** Source code.
- **/tests:** All Vitest tests, mirroring the `src/` hierarchy.
- **/public:** Static assets like `logo.svg`, `logo-512.png`, and screenshots.
- **/screenshots:** Project screenshots for GitHub (copies of public/screenshots).

## Workflow
1. **Validation:** `npm run check` and `npm test` must pass before any push.
2. **State Management:** Add new state to `SessionState` in `types.ts` and initialize in `store.ts`.
3. **Mocking:** Mock stores correctly in tests (refer to `tests/lib/components/Timer.test.ts` for patterns).
