<!-- src/lib/components/AmrapCounter.svelte -->
<script lang="ts">
  import { sessionStore, settingsStore, incrementRep, completeSet } from '../store';
  import { t } from '../i18n';
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
  
  let minutes = $derived(Math.floor($sessionStore.timeLeft / 60).toString().padStart(2, '0'));
  let seconds = $derived(($sessionStore.timeLeft % 60).toString().padStart(2, '0'));
</script>

<div class="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-color)] text-[var(--text-color)] select-none relative p-4 transition-colors duration-500">
  <button 
    class="absolute top-4 right-4 p-3 hover:bg-[var(--text-color)]/5 rounded-full transition-colors z-20"
    onclick={(e) => { e.stopPropagation(); onOpenSettings(); }}
    aria-label="Open Settings"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  </button>

  <!-- Circular Click Area -->
  <div 
    class="flex flex-col items-center justify-center rounded-full border bg-transparent transition-all duration-300 relative cursor-pointer outline-none active:scale-[0.98] border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] active:bg-cyan-500/5 focus:border-cyan-500"
    style="height: min(85vw, 65vh, 400px); width: min(85vw, 65vh, 400px); max-height: 400px; max-width: 400px;"
    onclick={() => incrementRep(targetReps, $settingsStore.autoAdvance, restDuration)}
    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && incrementRep(targetReps, $settingsStore.autoAdvance, restDuration)}
    role="button"
    tabindex={0}
    data-testid="counter-area"
  >
    <!-- AMRAP Dashboard content -->
    <div class="text-[10px] xs:text-xs font-bold tracking-[0.2em] text-cyan-500 uppercase mb-0.5">{$t('timeLeft') || 'TIME LEFT'}</div>
    
    <!-- Cyberpunk style master timer countdown -->
    <div class="text-[2.2rem] xs:text-[2.6rem] font-light tabular-nums tracking-tight text-cyan-400 mb-1 flex items-center gap-1.5 justify-center leading-none border border-cyan-500/20 bg-cyan-950/20 px-4 py-1.5 rounded-xl">
      <svg class="w-4 h-4 text-cyan-400 animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      <span>{minutes}:{seconds}</span>
    </div>

    <!-- Massive central currentRep count -->
    <div class="text-[6.5rem] xs:text-[7.5rem] leading-none font-extralight tabular-nums tracking-tighter my-0.5 text-white">
      {$sessionStore.currentRep}
    </div>
    
    <!-- Reps Target Info -->
    <button 
      type="button"
      class="flex flex-col items-center justify-center p-1 -m-1 hover:bg-[var(--text-color)]/5 rounded-xl transition-all cursor-pointer group/target relative z-10"
      onclick={(e) => { e.stopPropagation(); showQuickAdjust = true; }}
    >
      <span class="text-[9px] xs:text-[10px] font-bold text-gray-500 tracking-[0.2em] group-hover/target:text-cyan-300 uppercase border-b border-dotted border-gray-700 group-hover/target:border-cyan-500/40">
        {$t('targetRepsHeader')} {targetReps}
      </span>
    </button>

    <!-- Completed Rounds Tracker badge -->
    <div class="mt-4 border border-cyan-500/20 bg-cyan-500/5 px-4 py-1 rounded-full flex items-center gap-1 text-[10px] xs:text-xs text-cyan-300 font-bold uppercase tracking-widest">
      <span>{$t('roundsCompleted')}:</span>
      <span class="text-white text-sm font-black tabular-nums">{$sessionStore.amrapRoundsCompleted ?? 0}</span>
    </div>

    <!-- Manual Round Completer -->
    <button 
      class="mt-4 text-[8px] xs:text-[10px] font-bold tracking-[0.2em] text-cyan-500/60 hover:text-cyan-400 transition-all border border-cyan-500/20 bg-cyan-500/5 px-4 xs:px-6 py-2 rounded-full active:scale-95 z-10"
      onclick={(e) => { e.stopPropagation(); completeSet(targetReps, $settingsStore.autoAdvance, restDuration); }}
    >
      {$t('finishRound')}
    </button>
  </div>
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

<style>
  /* Extra scaling for very small screens */
  @media (max-width: 340px) {
    div[data-testid="counter-area"] {
      border-width: 0.5px;
    }
  }
</style>
