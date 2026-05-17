<!-- src/lib/components/Counter.svelte -->
<script lang="ts">
  import { sessionStore, settingsStore, incrementRep, manualAdvance } from '../store';
  
  let { targetReps }: { targetReps: number } = $props();
</script>

<div 
  class="flex flex-col items-center justify-center w-full h-full bg-black text-white cursor-pointer select-none"
  onclick={() => incrementRep(targetReps, $settingsStore.autoAdvance)}
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && incrementRep(targetReps, $settingsStore.autoAdvance)}
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
      onclick={(e) => { e.stopPropagation(); manualAdvance(); }}
    >
      NEXT ROUND
    </button>
  {/if}
</div>
