<!-- src/lib/components/Counter.svelte -->
<script lang="ts">
  import { sessionStore, settingsStore, incrementRep, manualAdvance } from '../store';
  
  let { targetReps, onOpenSettings }: { targetReps: number, onOpenSettings: () => void } = $props();
</script>

<div 
  class="flex flex-col items-center justify-center w-full h-full bg-black text-white cursor-pointer select-none relative"
  onclick={() => incrementRep(targetReps, $settingsStore.autoAdvance)}
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && incrementRep(targetReps, $settingsStore.autoAdvance)}
  tabindex="0"
  role="button"
  data-testid="counter-area"
>
  <button 
    class="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-full transition-colors z-20"
    onclick={(e) => { e.stopPropagation(); onOpenSettings(); }}
    aria-label="Open Settings"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  </button>

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
