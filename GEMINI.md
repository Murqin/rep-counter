# Rep Counter: Project Instructions

## Tech Stack
- **Framework:** Svelte 5 (strictly using Runes like `$state`, `$derived`, `$effect`).
- **Styling:** Tailwind CSS v4 + Plain CSS Variables for theming.
- **State Management:** Svelte Stores with `localStorage` persistence.

## Architectural Mandates

### 1. Timer Persistence (Smart Tick)
To prevent the timer from resetting on page refresh, the `sessionStore` tracks:
- `timeLeft`: Remaining seconds.
- `lastTick`: Unix timestamp of the last update.
**Logic:** In `updateTimer()`, we calculate `elapsed = now - lastTick`. If the user refreshes, the next "tick" will subtract the actual time passed since the last save, ensuring the countdown is accurate even across restarts.

### 2. Theming Strategy
- **AMOLED First:** Default background is `#000000`.
- **Implementation:** Use CSS variables (`--bg-color`, `--text-color`, etc.) defined in `src/app.css`.
- **Switching:** Toggling theme adds/removes the `.light` class on `document.documentElement`. Components must use `var(--var-name)` instead of hardcoded Tailwind colors for theme-sensitive elements.

### 3. UI/UX Standards
- **Scaling:** Settings and modals use `items-start` and `overflow-y-auto` to prevent content being cut off on small screens.
- **Hitboxes:** Interactive elements (buttons) must be at least 44x44px.
- **A11y:** Use semantic `<button>` elements. Avoid interactive `<div>` tags.

## Workflow
1. **Validation:** Always run `npm run check` and `npm test` before building.
2. **Persistence:** Any new session state must be added to `SessionState` in `types.ts` and initialized in `store.ts`.
3. **Tests:** Maintain 100% pass rate. All tests are located in the `tests/` directory, mirroring the `src/` structure. Mock stores correctly in Vitest (see `tests/lib/components/Timer.test.ts` for hoisting-safe mocking pattern).
