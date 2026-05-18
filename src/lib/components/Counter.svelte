<!-- src/lib/components/Counter.svelte -->
<script lang="ts">
  import { sessionStore, settingsStore, incrementRep, manualAdvance, completeSet } from '../store';
  import QuickAdjust from './QuickAdjust.svelte';
  
  let { targetReps: initialTargetReps, onOpenSettings }: { targetReps: number, onOpenSettings: () => void } = $props();

  let targetReps = $state(initialTargetReps);
  let showQuickAdjust = $state(false);

  $effect(() => {
    targetReps = initialTargetReps;
  });
</script>

<div 
  class="flex flex-col items-center justify-center w-full h-full bg-black text-white select-none relative"
>
  <button 
    class="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-full transition-colors z-20"
    onclick={(e) => { e.stopPropagation(); onOpenSettings(); }}
    aria-label="Open Settings"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  </button>

  <!-- Circular Click Area -->
  <div 
    class="flex flex-col items-center justify-center w-[85vw] h-[85vw] max-w-[400px] max-h-[400px] rounded-full border border-gray-800 bg-transparent active:bg-white/5 transition-all duration-75 cursor-pointer outline-none focus:border-gray-600"
    onclick={() => incrementRep(targetReps, $settingsStore.autoAdvance)}
    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && incrementRep(targetReps, $settingsStore.autoAdvance)}
    role="button"
    tabindex="0"
    data-testid="counter-area"
  >
    <div 
      class="text-sm font-bold tracking-widest text-gray-500 uppercase mb-2 hover:text-white transition-colors"
      onclick={(e) => { e.stopPropagation(); showQuickAdjust = true; }}
    >
      Round {$sessionStore.currentRound}
    </div>
    <div class="text-[10rem] leading-none font-light tabular-nums tracking-tighter">{$sessionStore.currentRep}</div>
    <div 
      class="text-xs font-bold text-gray-700 mt-4 tracking-widest hover:text-white transition-colors"
      onclick={(e) => { e.stopPropagation(); showQuickAdjust = true; }}
    >
      TARGET {targetReps}
    </div>
    <button 
      class="mt-8 text-[10px] font-bold tracking-[0.2em] text-white/30 hover:text-white transition-all border border-white/10 px-6 py-2.5 rounded-full active:scale-95 z-10"
      onclick={(e) => { e.stopPropagation(); completeSet(targetReps, $settingsStore.autoAdvance); }}
    >
      FINISH SET
    </button>
  </div>
  
  {#if !$settingsStore.autoAdvance && $sessionStore.currentRep >= targetReps}
    <button 
      class="mt-12 px-8 py-4 border border-gray-700 rounded-full text-sm font-bold tracking-widest hover:bg-white/5 transition-colors z-10"
      onclick={(e) => { e.stopPropagation(); manualAdvance(); }}
    >
      NEXT ROUND
    </button>
  {/if}
</div>

{#if showQuickAdjust}
  <QuickAdjust 
    targetReps={targetReps}
    onUpdateTarget={(val) => targetReps = val}
    onclose={() => showQuickAdjust = false}
  />
{/if}
