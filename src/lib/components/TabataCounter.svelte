<!-- src/lib/components/TabataCounter.svelte -->
<script lang="ts">
  import { sessionStore, settingsStore, incrementRep, completeSet, endRest } from '../store';
  import { t } from '../i18n';
  
  let { 
    targetReps, 
    restDuration,
    onOpenSettings 
  }: { 
    targetReps: number, 
    restDuration: number,
    onOpenSettings: () => void 
  } = $props();

  let isResting = $derived($sessionStore.isResting);
  
  let minutes = $derived(Math.floor($sessionStore.timeLeft / 60).toString().padStart(2, '0'));
  let seconds = $derived(($sessionStore.timeLeft % 60).toString().padStart(2, '0'));
</script>

<div 
  class="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-color)] text-[var(--text-color)] select-none relative p-4 transition-colors duration-500"
  style={isResting ? `background-color: ${$settingsStore.theme === 'light' ? '#eefbf7' : '#021812'}` : ''}
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
      {isResting 
        ? 'cursor-default pointer-events-none border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-500/[0.02]' 
        : 'cursor-pointer outline-none active:scale-[0.98] border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)] active:bg-orange-500/5 focus:border-orange-500'}"
    style="height: min(85vw, 65vh, 400px); width: min(85vw, 65vh, 400px); max-height: 400px; max-width: 400px;"
    onclick={!isResting ? () => incrementRep(targetReps, $settingsStore.autoAdvance, restDuration) : undefined}
    onkeydown={!isResting ? (e) => (e.key === 'Enter' || e.key === ' ') && incrementRep(targetReps, $settingsStore.autoAdvance, restDuration) : undefined}
    role="button"
    tabindex={isResting ? -1 : 0}
    data-testid="counter-area"
  >
    {#if !isResting}
      <!-- Tabata Work State -->
      <div class="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-orange-500 uppercase mb-2 animate-pulse">
        {$t('workTime')}
      </div>
      
      <div class="text-[6.5rem] xs:text-[7.5rem] sm:text-[8rem] font-light tabular-nums tracking-tighter text-orange-400 my-1 leading-none">
        {minutes}:{seconds}
      </div>
      
      <!-- Round indicator -->
      <div class="text-[11px] xs:text-xs text-gray-500 uppercase tracking-[0.25em] font-bold mt-2">
        {$t('round')} {$sessionStore.currentRound} / {$sessionStore.totalRounds}
      </div>

      <!-- Streamlined micro-badge for reps -->
      <div class="mt-4 px-3 py-0.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-[9px] xs:text-[10px] text-orange-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
        <span>{$t('reps')}:</span>
        <span class="text-white font-black tabular-nums">{$sessionStore.currentRep}</span>
      </div>
    {:else}
      <!-- Tabata Rest State -->
      <div class="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-emerald-500 uppercase mb-2">
        {$t('breakTime')}
      </div>
      
      <div class="text-[6.5rem] xs:text-[7.5rem] sm:text-[8rem] font-light tabular-nums tracking-tighter text-emerald-400 my-1 leading-none">
        {minutes}:{seconds}
      </div>
      
      <div class="text-[10px] xs:text-xs text-gray-400 uppercase tracking-[0.2em] font-bold mt-3">
        {$t('nextRound')}: Round {$sessionStore.currentRound + 1} / {$sessionStore.totalRounds}
      </div>

      <button 
        class="mt-8 text-[8px] xs:text-[10px] font-bold tracking-[0.2em] text-emerald-500/60 hover:text-emerald-400 transition-all border border-emerald-500/20 bg-emerald-500/5 px-4 xs:px-6 py-2 rounded-full active:scale-95 z-10 pointer-events-auto"
        onclick={(e) => { e.stopPropagation(); endRest(); }}
      >
        {$t('skipBreak')}
      </button>
    {/if}
  </div>
</div>

<style>
  /* Extra scaling for very small screens */
  @media (max-width: 340px) {
    div[data-testid="counter-area"] {
      border-width: 0.5px;
    }
  }
</style>
