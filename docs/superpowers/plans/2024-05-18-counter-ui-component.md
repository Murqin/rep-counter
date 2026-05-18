# Counter UI Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the main Counter UI component that allows users to increment reps and advance rounds.

**Architecture:** A Svelte 5 component that subscribes to `sessionStore` and `settingsStore` from `src/lib/store.ts`. It takes `targetReps` as a prop.

**Tech Stack:** Svelte 5, Vitest, Testing Library Svelte, Tailwind CSS.

---

### Task 1: Counter UI Component

**Files:**
- Create: `src/lib/components/Counter.svelte`
- Create: `src/lib/components/Counter.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/components/Counter.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import Counter from './Counter.svelte';
import * as storeModule from '../store';
import { vi, describe, it, expect } from 'vitest';

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
    const { getByText } = render(Counter, { targetReps: 10 });
    expect(getByText('5')).toBeTruthy();
    expect(getByText('Round 2')).toBeTruthy();
  });

  it('calls incrementRep on click', async () => {
    const { getByTestId } = render(Counter, { targetReps: 10 });
    const button = getByTestId('counter-area');
    await fireEvent.click(button);
    expect(storeModule.incrementRep).toHaveBeenCalledWith(10, false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/components/Counter.test.ts`
Expected: FAIL (Component not found or compilation error)

- [ ] **Step 3: Write minimal implementation**

```svelte
<!-- src/lib/components/Counter.svelte -->
<script lang="ts">
  import { sessionStore, settingsStore, incrementRep, manualAdvance } from '../store';
  
  let { targetReps }: { targetReps: number } = $props();
  
  // In Svelte 5, we can use the $store syntax but since it's Svelte 4 style store, 
  // we use $sessionStore and $settingsStore which work fine in Svelte 5 components too.
</script>

<div 
  class="flex flex-col items-center justify-center w-full h-full bg-black text-white cursor-pointer select-none"
  on:click={() => incrementRep(targetReps, $settingsStore.autoAdvance)}
  on:keydown={(e) => e.key === 'Enter' && incrementRep(targetReps, $settingsStore.autoAdvance)}
  tabindex="0"
  role="button"
  data-testid="counter-area"
>
  <div class="text-sm font-bold tracking-widest text-gray-500 uppercase">Round {$sessionStore.currentRound}</div>
  <div class="text-9xl font-light tabular-nums">{$sessionStore.currentRep}</div>
  <div class="text-xs font-bold text-gray-700 mt-2">TARGET: {targetReps}</div>
  
  {#if !$settingsStore.autoAdvance && $sessionStore.currentRep >= targetReps}
    <button 
      class="mt-8 px-6 py-3 border border-gray-700 rounded text-sm hover:bg-gray-900 z-10 relative"
      on:click|stopPropagation={manualAdvance}
    >
      NEXT ROUND
    </button>
  {/if}
</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/components/Counter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/Counter.svelte src/lib/components/Counter.test.ts
git commit -m "feat: implement Counter UI component"
```
