<!-- src/lib/components/Counter.svelte -->
<script lang="ts">
  import { sessionStore, settingsStore, incrementRep, manualAdvance, completeSet } from '../store';
  import QuickAdjust from './QuickAdjust.svelte';
  
  let { 
    targetReps, 
    restDuration,
    onUpdateTarget,
    onUpdateRest,
    onOpenSettings 
  }: { 
    targetReps: number, 
    restDuration: number,
    onUpdateTarget: (val: number) => void,
    onUpdateRest: (val: number) => void,
    onOpenSettings: () => void 
  } = $props();

  let showQuickAdjust = $state(false);
</script>

<div 
  class="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-color)] text-[var(--text-color)] select-none relative"
>
  <button 
    class="absolute top-8 right-8 p-3 hover:bg-[var(--text-color)]/5 rounded-full transition-colors z-20"
    onclick={(e) => { e.stopPropagation(); onOpenSettings(); }}
    aria-label="Open Settings"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  </button>

  <!-- Circular Click Area -->
  <div 
    class="flex flex-col items-center justify-center w-[85vw] h-[85vw] max-w-[400px] max-h-[400px] rounded-full border border-[var(--text-color)]/10 bg-transparent active:bg-[var(--text-color)]/5 transition-all duration-75 cursor-pointer outline-none focus:border-[var(--text-color)]/30 relative"
    onclick={() => incrementRep(targetReps, $settingsStore.autoAdvance)}
    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && incrementRep(targetReps, $settingsStore.autoAdvance)}
    role="button"
    tabindex="0"
    data-testid="counter-area"
  >
    <button 
      type="button"
      class="flex flex-col items-center justify-center p-4 -m-4 hover:bg-[var(--text-color)]/5 rounded-2xl transition-all cursor-pointer group/round relative z-10"
      onclick={(e) => { e.stopPropagation(); showQuickAdjust = true; }}
    >
      <div class="relative flex items-center justify-center">
        <span 
          class="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase group-hover/round:text-[var(--text-color)] transition-colors border-b border-dotted border-gray-700 group-hover/round:border-[var(--text-color)]/40"
        >
          Round {$sessionStore.currentRound}
        </span>
        <svg class="w-3 h-3 text-gray-600 group-hover/round:text-[var(--text-color)]/60 transition-colors absolute -right-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
      </div>
    </button>

    <div class="text-[10rem] leading-none font-light tabular-nums tracking-tighter my-2">{$sessionStore.currentRep}</div>
    
    <button 
      type="button"
      class="flex flex-col items-center justify-center p-4 -m-4 mt-4 hover:bg-[var(--text-color)]/5 rounded-2xl transition-all cursor-pointer group/target relative z-10"
      onclick={(e) => { e.stopPropagation(); showQuickAdjust = true; }}
    >
      <div class="relative flex items-center justify-center">
        <span 
          class="text-xs font-bold text-gray-700 tracking-[0.15em] group-hover/target:text-[var(--text-color)] transition-colors border-b border-dotted border-gray-800 group-hover/target:border-[var(--text-color)]/30"
        >
          TARGET {targetReps}
        </span>
        <svg class="w-2.5 h-2.5 text-gray-800 group-hover/target:text-[var(--text-color)]/40 transition-colors absolute -right-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
      </div>
    </button>

    <button 
      class="mt-8 text-[10px] font-bold tracking-[0.2em] text-[var(--text-color)]/30 hover:text-[var(--text-color)] transition-all border border-[var(--text-color)]/10 px-6 py-2.5 rounded-full active:scale-95 z-10"
      onclick={(e) => { e.stopPropagation(); completeSet(targetReps, $settingsStore.autoAdvance); }}
    >
      FINISH ROUND
    </button>
  </div>
  
  {#if !$settingsStore.autoAdvance && $sessionStore.currentRep >= targetReps}
    <button 
      class="mt-12 px-8 py-4 border border-[var(--text-color)]/20 rounded-full text-sm font-bold tracking-widest hover:bg-[var(--text-color)]/5 transition-colors z-10"
      onclick={(e) => { e.stopPropagation(); manualAdvance(); }}
    >
      NEXT ROUND
    </button>
  {/if}
</div>

{#if showQuickAdjust}
  <QuickAdjust 
    targetReps={targetReps}
    onUpdateTarget={onUpdateTarget}
    restDuration={restDuration}
    onUpdateRest={onUpdateRest}
    onclose={() => showQuickAdjust = false}
  />
{/if}
