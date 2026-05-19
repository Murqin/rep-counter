<script lang="ts">
  import { onMount } from 'svelte';
  import Counter from './lib/components/Counter.svelte';
  import Timer from './lib/components/Timer.svelte';
  import Success from './lib/components/Success.svelte';
  import PresetManager from './lib/components/PresetManager.svelte';
  import { sessionStore, presetsStore, settingsStore } from './lib/store';
  import type { Preset } from './lib/types';
  import { requestWakeLock, type WakeLockSentinel } from './lib/wakeLock';

  const defaultPreset: Preset = {
    id: 'default',
    name: 'Quick Start',
    rounds: 5,
    repsPerRound: 10,
    breakDuration: 30
  };

  onMount(() => {
    // Bug #6: Clear stale isTransitioning from localStorage (e.g., page refresh mid-transition)
    if ($sessionStore.isTransitioning) {
      sessionStore.update(s => ({ ...s, isTransitioning: false }));
    }

    if ($presetsStore.length === 0) {
      presetsStore.set([defaultPreset]);
    }
    if (!$sessionStore.activePresetId) {
      sessionStore.update(s => ({ 
        ...s, 
        activePresetId: defaultPreset.id,
        totalRounds: defaultPreset.rounds
      }));
    }

    // Wake Lock Logic
    let lock: WakeLockSentinel | null = null;
    const acquireLock = async () => {
      // Bug #9: Release previous lock before acquiring a new one
      if (lock && !lock.released) {
        try { lock.release(); } catch { /* ignore */ }
      }
      lock = await requestWakeLock();
    };
    
    acquireLock();

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        acquireLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (lock) lock.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  });

  let activePreset = $derived($presetsStore.find(p => p.id === $sessionStore.activePresetId) || defaultPreset);
  let isSettingsOpen = $state(false);

  // Session-specific overrides (reset when preset changes)
  let overrideTargetReps = $state<number | null>(null);
  let overrideBreakDuration = $state<number | null>(null);

  let lastPresetId = $sessionStore.activePresetId;
  $effect(() => {
    // Only reset overrides when the preset ID actually changes
    const currentId = $sessionStore.activePresetId;
    if (currentId !== lastPresetId) {
      overrideTargetReps = null;
      overrideBreakDuration = null;
      lastPresetId = currentId;
    }
  });

  let currentTargetReps = $derived(overrideTargetReps ?? activePreset.repsPerRound);
  let currentBreakDuration = $derived(overrideBreakDuration ?? activePreset.breakDuration);

  $effect(() => {
    if ($settingsStore.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  });
</script>

<main class="fixed inset-0 bg-[var(--bg-color)] font-sans select-none text-[var(--text-color)] overflow-hidden">
  <div class="relative w-full h-full">
    {#if $sessionStore.currentRound > $sessionStore.totalRounds}
      <div class="absolute inset-0">
        <Success onMenu={() => isSettingsOpen = true} />
      </div>
    {:else if $sessionStore.isResting && currentBreakDuration > 0}
      <div class="absolute inset-0">
        <Timer duration={currentBreakDuration} />
      </div>
    {:else}
      <div class="absolute inset-0">
        <Counter 
          targetReps={currentTargetReps} 
          restDuration={currentBreakDuration}
          onUpdateTarget={(val) => overrideTargetReps = val}
          onUpdateRest={(val) => overrideBreakDuration = val}
          onOpenSettings={() => isSettingsOpen = true} 
        />
      </div>
    {/if}
  </div>

  {#if isSettingsOpen}
    <PresetManager onclose={() => isSettingsOpen = false} />
  {/if}
</main>
