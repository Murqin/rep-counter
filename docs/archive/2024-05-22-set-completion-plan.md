# Set Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a "Finish Set" feature to allow completing all reps in a round with one tap.

**Architecture:** Add a `completeSet` function to the store and a button to the Counter UI. Reuse existing state transitions.

**Tech Stack:** Svelte 5, Vitest.

---

### Task 1: Store Logic for Bulk Completion

**Files:**
- Modify: `src/lib/store.ts`
- Modify: `src/lib/store.test.ts`

- [ ] **Step 1: Add `completeSet` to Store**
```typescript
// src/lib/store.ts
export function completeSet(targetReps: number, autoAdvance: boolean) {
  sessionStore.update(s => {
    if (s.isResting) return s;
    
    let nextRound = s.currentRound;
    let isResting = s.isResting;

    if (autoAdvance) {
      nextRound++;
      if (nextRound <= s.totalRounds) {
        isResting = true;
      }
    }
    
    // Set to targetReps if not auto-advancing, or 0 if advancing
    return { 
      ...s, 
      currentRep: autoAdvance ? 0 : targetReps, 
      currentRound: nextRound, 
      isResting 
    };
  });
}
```

- [ ] **Step 2: Add Test Case**
Add a test in `src/lib/store.test.ts` to verify `completeSet` handles round advancement correctly.

- [ ] **Step 3: Commit**
`git add src/lib/store.ts src/lib/store.test.ts && git commit -m "feat: add completeSet logic to store"`

---

### Task 2: Counter UI Update

**Files:**
- Modify: `src/lib/components/Counter.svelte`

- [ ] **Step 1: Add "Finish Set" Button**
Add a button below the "Target" text that calls `completeSet`.
```svelte
<!-- src/lib/components/Counter.svelte -->
<button 
  class="mt-8 text-[10px] font-bold tracking-[0.2em] text-white/30 hover:text-white transition-all border border-white/10 px-4 py-2 rounded-full active:scale-95"
  onclick={(e) => { e.stopPropagation(); completeSet(targetReps, $settingsStore.autoAdvance); }}
>
  FINISH SET
</button>
```

- [ ] **Step 2: Verify & Build**
Run `npm run check` and `npm run build`.

- [ ] **Step 3: Commit**
`git add src/lib/components/Counter.svelte && git commit -m "feat: add Finish Set button to Counter UI"`
