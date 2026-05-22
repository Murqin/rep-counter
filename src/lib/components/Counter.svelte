<!-- src/lib/components/Counter.svelte -->
<script lang="ts">
  import { sessionStore, settingsStore, incrementRep, manualAdvance, completeSet, advanceRound, endRest } from '../store';
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

  let workoutType = $derived($sessionStore.workoutType || 'classic');
  let isResting = $derived($sessionStore.isResting);
  
  // Timer formatting
  let minutes = $derived(Math.floor($sessionStore.timeLeft / 60).toString().padStart(2, '0'));
  let seconds = $derived(($sessionStore.timeLeft % 60).toString().padStart(2, '0'));

  $effect(() => {
    if ($sessionStore.isTransitioning) {
      const timer = setTimeout(() => {
        advanceRound();
      }, 600); // 600ms pause to show the final rep
      return () => clearTimeout(timer);
    }
  });
</script>

<div 
  class="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-color)] text-[var(--text-color)] select-none relative p-4 transition-colors duration-500"
  style={workoutType === 'tabata' && isResting ? `background-color: ${$settingsStore.theme === 'light' ? '#eefbf7' : '#021812'}` : ''}
>
  <button 
    class="absolute top-4 right-4 p-3 hover:bg-[var(--text-color)]/5 rounded-full transition-colors z-20"
    onclick={(e) => { e.stopPropagation(); onOpenSettings(); }}
    aria-label="Open Settings"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  </button>

  <!-- Circular Click Area -->
  <div 
    class="flex flex-col items-center justify-center rounded-full border bg-transparent transition-all duration-300 relative
      {isResting ? 'cursor-default pointer-events-none' : 'cursor-pointer outline-none active:scale-[0.98]'}
      {workoutType === 'classic' 
        ? 'border-[var(--text-color)]/10 active:bg-[var(--text-color)]/5 focus:border-[var(--text-color)]/30' 
        : ''}
      {workoutType === 'emom' && !isResting
        ? 'border-[var(--text-color)]/10 active:bg-[var(--text-color)]/5 focus:border-[var(--text-color)]/30' 
        : ''}
      {workoutType === 'emom' && isResting
        ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-500/[0.02]' 
        : ''}
      {workoutType === 'tabata' && !isResting
        ? 'border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)] active:bg-orange-500/5 focus:border-orange-500' 
        : ''}
      {workoutType === 'tabata' && isResting
        ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-500/[0.02]' 
        : ''}
      {workoutType === 'amrap'
        ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] active:bg-cyan-500/5 focus:border-cyan-500' 
        : ''}"
    style="height: min(85vw, 65vh, 400px); width: min(85vw, 65vh, 400px); max-height: 400px; max-width: 400px;"
    onclick={!isResting ? () => incrementRep(targetReps, $settingsStore.autoAdvance, restDuration) : undefined}
    onkeydown={!isResting ? (e) => (e.key === 'Enter' || e.key === ' ') && incrementRep(targetReps, $settingsStore.autoAdvance, restDuration) : undefined}
    role="button"
    tabindex={isResting ? -1 : 0}
    data-testid="counter-area"
  >
    {#if workoutType === 'classic'}
      <!-- Classic Mode Content -->
      <button 
        type="button"
        class="flex flex-col items-center justify-center p-2 -m-2 hover:bg-[var(--text-color)]/5 rounded-2xl transition-all cursor-pointer group/round relative z-10"
        onclick={(e) => { e.stopPropagation(); showQuickAdjust = true; }}
      >
        <div class="relative flex items-center justify-center">
          <span 
            class="text-[10px] xs:text-sm font-bold tracking-[0.2em] text-gray-500 uppercase group-hover/round:text-[var(--text-color)] transition-colors border-b border-dotted border-gray-700 group-hover/round:border-[var(--text-color)]/40"
          >
            {$t('round')} {$sessionStore.currentRound}
          </span>
          <svg class="w-3 h-3 text-gray-600 group-hover/round:text-[var(--text-color)]/60 transition-colors absolute -right-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </div>
      </button>

      <div class="text-[8rem] xs:text-[10rem] sm:text-[12rem] leading-none font-light tabular-nums tracking-tighter my-2">{$sessionStore.currentRep}</div>
      
      <button 
        type="button"
        class="flex flex-col items-center justify-center p-2 -m-2 mt-2 hover:bg-[var(--text-color)]/5 rounded-2xl transition-all cursor-pointer group/target relative z-10"
        onclick={(e) => { e.stopPropagation(); showQuickAdjust = true; }}
      >
        <div class="relative flex items-center justify-center">
          <span 
            class="text-[10px] xs:text-xs font-bold text-gray-700 tracking-[0.15em] group-hover/target:text-[var(--text-color)] transition-colors border-b border-dotted border-gray-800 group-hover/target:border-[var(--text-color)]/30"
          >
            {$t('targetRepsHeader')} {targetReps}
          </span>
          <svg class="w-2.5 h-2.5 text-gray-800 group-hover/target:text-[var(--text-color)]/40 transition-colors absolute -right-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </div>
      </button>

      <button 
        class="mt-6 sm:mt-8 text-[8px] xs:text-[10px] font-bold tracking-[0.2em] text-[var(--text-color)]/30 hover:text-[var(--text-color)] transition-all border border-[var(--text-color)]/10 px-4 xs:px-6 py-2 rounded-full active:scale-95 z-10"
        onclick={(e) => { e.stopPropagation(); completeSet(targetReps, $settingsStore.autoAdvance, restDuration); }}
      >
        {$t('finishRound')}
      </button>

    {:else if workoutType === 'emom'}
      <!-- EMOM Mode Content -->
      {#if !isResting}
        <button 
          type="button"
          class="flex flex-col items-center justify-center p-2 -m-2 hover:bg-[var(--text-color)]/5 rounded-2xl transition-all cursor-pointer group/round relative z-10"
          onclick={(e) => { e.stopPropagation(); showQuickAdjust = true; }}
        >
          <div class="relative flex items-center justify-center">
            <span 
              class="text-[10px] xs:text-sm font-bold tracking-[0.2em] text-gray-500 uppercase group-hover/round:text-[var(--text-color)] transition-colors border-b border-dotted border-gray-700 group-hover/round:border-[var(--text-color)]/40"
            >
              {$t('round')} {$sessionStore.currentRound} / {$sessionStore.totalRounds}
            </span>
            <svg class="w-3 h-3 text-gray-600 group-hover/round:text-[var(--text-color)]/60 transition-colors absolute -right-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </div>
        </button>

        <div class="text-[8rem] xs:text-[10rem] leading-none font-light tabular-nums tracking-tighter my-1">{$sessionStore.currentRep}</div>
        
        <div class="text-[1.5rem] sm:text-[1.8rem] font-medium tabular-nums tracking-tight text-[var(--text-color)]/80 mb-2 flex items-center gap-1.5 justify-center">
          <svg class="w-5 h-5 text-[var(--text-color)]/40 animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>{minutes}:{seconds}</span>
        </div>

        <button 
          type="button"
          class="flex flex-col items-center justify-center p-2 -m-2 hover:bg-[var(--text-color)]/5 rounded-2xl transition-all cursor-pointer group/target relative z-10"
          onclick={(e) => { e.stopPropagation(); showQuickAdjust = true; }}
        >
          <div class="relative flex items-center justify-center">
            <span 
              class="text-[10px] xs:text-xs font-bold text-gray-700 tracking-[0.15em] group-hover/target:text-[var(--text-color)] transition-colors border-b border-dotted border-gray-800 group-hover/target:border-[var(--text-color)]/30"
            >
              {$t('targetRepsHeader')} {targetReps}
            </span>
          </div>
        </button>

        <button 
          class="mt-4 sm:mt-6 text-[8px] xs:text-[10px] font-bold tracking-[0.2em] text-[var(--text-color)]/30 hover:text-[var(--text-color)] transition-all border border-[var(--text-color)]/10 px-4 xs:px-6 py-2 rounded-full active:scale-95 z-10"
          onclick={(e) => { e.stopPropagation(); completeSet(targetReps, $settingsStore.autoAdvance, restDuration); }}
        >
          {$t('finishRound')}
        </button>
      {:else}
        <div class="text-[10px] xs:text-sm font-bold tracking-[0.2em] text-emerald-500 uppercase mb-2">{$t('breakTime')}</div>
        <div class="text-[6rem] xs:text-[7rem] sm:text-[8rem] font-light tabular-nums tracking-tighter text-emerald-400 leading-none">{minutes}:{seconds}</div>
        <div class="text-[10px] xs:text-xs text-gray-500 uppercase tracking-widest font-semibold mt-4">{$t('round')} {$sessionStore.currentRound} {$t('done')}</div>

        <button 
          class="mt-8 text-[8px] xs:text-[10px] font-bold tracking-[0.2em] text-emerald-500/60 hover:text-emerald-400 transition-all border border-emerald-500/20 bg-emerald-500/5 px-4 xs:px-6 py-2 rounded-full active:scale-95 z-10 pointer-events-auto"
          onclick={(e) => { e.stopPropagation(); endRest(); }}
        >
          {$t('skipBreak')}
        </button>
      {/if}

    {:else if workoutType === 'tabata'}
      <!-- Tabata Mode Content -->
      {#if !isResting}
        <div class="text-[10px] xs:text-sm font-bold tracking-[0.2em] text-orange-500 uppercase mb-1">{$t('workTime')}</div>
        <div class="text-[6rem] xs:text-[7rem] sm:text-[8rem] font-light tabular-nums tracking-tighter text-orange-400 my-1 leading-none">{minutes}:{seconds}</div>
        
        <div class="text-xs text-gray-500 tracking-wider font-semibold mb-2">
          {$t('reps')}: <span class="text-[var(--text-color)] text-sm font-bold tabular-nums">{$sessionStore.currentRep}</span>
        </div>

        <div class="text-[10px] xs:text-xs text-gray-500 uppercase tracking-[0.15em] font-bold mt-1">
          {$t('round')} {$sessionStore.currentRound} / {$sessionStore.totalRounds}
        </div>

        <button 
          class="mt-6 text-[8px] xs:text-[10px] font-bold tracking-[0.2em] text-orange-500/60 hover:text-orange-400 transition-all border border-orange-500/20 bg-orange-500/5 px-4 xs:px-6 py-2 rounded-full active:scale-95 z-10"
          onclick={(e) => { e.stopPropagation(); completeSet(targetReps, $settingsStore.autoAdvance, restDuration); }}
        >
          {$t('finishRound')}
        </button>
      {:else}
        <div class="text-[10px] xs:text-sm font-bold tracking-[0.2em] text-emerald-500 uppercase mb-1">{$t('breakTime')}</div>
        <div class="text-[6rem] xs:text-[7rem] sm:text-[8rem] font-light tabular-nums tracking-tighter text-emerald-400 my-1 leading-none">{minutes}:{seconds}</div>
        
        <div class="text-[10px] xs:text-xs text-gray-500 uppercase tracking-[0.15em] font-bold mt-2">
          {$t('nextRound')}: Round {$sessionStore.currentRound + 1} / {$sessionStore.totalRounds}
        </div>

        <button 
          class="mt-8 text-[8px] xs:text-[10px] font-bold tracking-[0.2em] text-emerald-500/60 hover:text-emerald-400 transition-all border border-emerald-500/20 bg-emerald-500/5 px-4 xs:px-6 py-2 rounded-full active:scale-95 z-10 pointer-events-auto"
          onclick={(e) => { e.stopPropagation(); endRest(); }}
        >
          {$t('skipBreak')}
        </button>
      {/if}

    {:else if workoutType === 'amrap'}
      <!-- AMRAP Mode Content -->
      <div class="text-[10px] xs:text-sm font-bold tracking-[0.2em] text-cyan-500 uppercase mb-1">{$t('timeLeft') || 'TIME LEFT'}</div>
      <div class="text-[2rem] sm:text-[2.2rem] font-light tabular-nums tracking-tight text-cyan-400 mb-1 flex items-center gap-1.5 justify-center leading-none">
        <span>{minutes}:{seconds}</span>
      </div>

      <div class="text-[6rem] xs:text-[7rem] leading-none font-light tabular-nums tracking-tighter my-1">{$sessionStore.currentRep}</div>
      
      <button 
        type="button"
        class="flex flex-col items-center justify-center p-1 -m-1 hover:bg-[var(--text-color)]/5 rounded-2xl transition-all cursor-pointer group/target relative z-10"
        onclick={(e) => { e.stopPropagation(); showQuickAdjust = true; }}
      >
        <div class="relative flex items-center justify-center">
          <span 
            class="text-[9px] xs:text-[10px] font-bold text-gray-700 tracking-[0.15em] group-hover/target:text-[var(--text-color)] transition-colors border-b border-dotted border-gray-800 group-hover/target:border-[var(--text-color)]/30"
          >
            {$t('targetRepsHeader')} {targetReps}
          </span>
        </div>
      </button>

      <div class="text-[10px] xs:text-xs text-cyan-300 font-bold uppercase tracking-widest mt-3">
        {$t('roundsCompleted')}: <span class="text-white text-sm font-black tabular-nums">{$sessionStore.amrapRoundsCompleted ?? 0}</span>
      </div>

      <button 
        class="mt-4 text-[8px] xs:text-[10px] font-bold tracking-[0.2em] text-cyan-500/60 hover:text-cyan-400 transition-all border border-cyan-500/20 bg-cyan-500/5 px-4 xs:px-6 py-2 rounded-full active:scale-95 z-10"
        onclick={(e) => { e.stopPropagation(); completeSet(targetReps, $settingsStore.autoAdvance, restDuration); }}
      >
        {$t('finishRound')}
      </button>
    {/if}
  </div>
  
  {#if workoutType === 'classic' && !$settingsStore.autoAdvance && $sessionStore.currentRep >= targetReps}
    <button 
      class="mt-8 sm:mt-12 px-6 xs:px-8 py-3 xs:py-4 border border-[var(--text-color)]/20 rounded-full text-xs xs:text-sm font-bold tracking-widest hover:bg-[var(--text-color)]/5 transition-colors z-10"
      onclick={(e) => { e.stopPropagation(); manualAdvance(restDuration); }}
    >
      {$t('nextRound')}
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

<style>
  /* Extra scaling for very small screens */
  @media (max-width: 340px) {
    div[data-testid="counter-area"] {
      border-width: 0.5px;
    }
  }
</style>
