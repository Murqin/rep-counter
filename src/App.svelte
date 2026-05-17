<script lang="ts">
  import { onMount } from 'svelte';
  import Counter from './lib/components/Counter.svelte';
  import Timer from './lib/components/Timer.svelte';
  import { sessionStore, presetsStore } from './lib/store';
  import type { Preset } from './lib/types';

  const defaultPreset: Preset = {
    id: 'default',
    name: 'Quick Start',
    rounds: 5,
    repsPerRound: 10,
    breakDuration: 30
  };

  onMount(() => {
    if ($presetsStore.length === 0) {
      presetsStore.set([defaultPreset]);
    }
    if (!$sessionStore.activePresetId) {
      sessionStore.update(s => ({ ...s, activePresetId: defaultPreset.id }));
    }
  });

  let activePreset = $derived($presetsStore.find(p => p.id === $sessionStore.activePresetId) || defaultPreset);
</script>

<main class="w-screen h-screen bg-black overflow-hidden font-sans select-none text-white">
  {#if $sessionStore.isResting && activePreset.breakDuration > 0}
    <Timer duration={activePreset.breakDuration} />
  {:else}
    <Counter targetReps={activePreset.repsPerRound} />
  {/if}
</main>
