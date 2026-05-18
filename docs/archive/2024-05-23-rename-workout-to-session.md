# Rename Workout to Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generalize the application by replacing all instances of "Workout" with "Session" across UI, tests, and documentation.

**Architecture:** Systematic replacement of terminology in strings and test descriptions. No logic changes.

**Tech Stack:** Svelte, TypeScript, Vitest, Testing Library.

---

### Task 1: Update UI Components

**Files:**
- Modify: `src/lib/components/Success.svelte`
- Modify: `src/lib/components/PresetManager.svelte` (Searching for any other UI strings)

- [ ] **Step 1: Update Success.svelte**
  Change "Workout Complete" to "Session Complete".

- [ ] **Step 2: Check PresetManager.svelte**
  Check for default preset names or placeholders.

### Task 2: Update Test Files

**Files:**
- Modify: `src/App.test.ts`
- Modify: `src/lib/components/Success.test.ts`
- Modify: `src/lib/components/PresetManager.test.ts`

- [ ] **Step 1: Update App.test.ts**
  Update test descriptions and expectations.

- [ ] **Step 2: Update Success.test.ts**
  Update expectations.

- [ ] **Step 3: Update PresetManager.test.ts**
  Update expectations for "New Workout" -> "New Session".

### Task 3: Update Documentation

**Files:**
- Modify: `docs/superpowers/specs/2024-05-22-enhancement-suite-design.md`
- Modify: `docs/handovers/task-2-wake-lock.md`
- Modify: `docs/handovers/task-5-preset-editing.md`

- [ ] **Step 1: Update enhancement-suite-design.md**
- [ ] **Step 2: Update handovers**

### Task 4: Verification

- [ ] **Step 1: Run all tests**
  Run: `npm test`
  Expected: All tests pass with new terminology.
