<!-- src/lib/components/Success.svelte -->
<script lang="ts">
  import { sessionStore, presetsStore } from '../store';
  import { t } from '../i18n';
  import { fade, scale } from 'svelte/transition';
  
  let { onMenu }: { onMenu: () => void } = $props();

  function restart() {
    const s = $sessionStore;
    const presets = $presetsStore;
    const preset = presets.find(p => p.id === s.activePresetId);
    
    const workoutType = s.workoutType || 'classic';
    const totalRounds = workoutType === 'amrap' ? 999 : (preset?.rounds ?? 5);
    const initialTime = workoutType === 'amrap' 
      ? (preset?.amrapDuration ?? 600)
      : (workoutType === 'emom'
          ? (preset?.emomInterval ?? 60)
          : (workoutType === 'tabata'
              ? (preset?.workDuration ?? 20)
              : 0
            )
        );

    sessionStore.set({
      ...s,
      currentRound: 1,
      currentRep: 0,
      isResting: false,
      isTransitioning: false,
      timeLeft: initialTime,
      lastTick: workoutType !== 'classic' ? Date.now() : null,
      amrapRoundsCompleted: 0
    });
  }

  function adjustAmrapRounds(amount: number) {
    sessionStore.update(s => ({
      ...s,
      amrapRoundsCompleted: Math.max(0, (s.amrapRoundsCompleted ?? 0) + amount)
    }));
  }

  function adjustReps(amount: number) {
    sessionStore.update(s => ({
      ...s,
      currentRep: Math.max(0, s.currentRep + amount)
    }));
  }
</script>

<div 
  transition:fade={{ duration: 300 }}
  class="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-color)] text-[var(--text-color)] p-8 text-center overflow-y-auto"
>
  <div 
    transition:scale={{ delay: 200, duration: 400 }}
    class="w-24 h-24 bg-[var(--text-color)] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] shrink-0"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--bg-color)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  </div>
  
  <h1 class="text-4xl font-light mb-2 tracking-tight">{$t('sessionComplete')}</h1>
  <p class="text-gray-500 uppercase tracking-widest text-xs mb-6 font-bold">{$t('reachedGoal')}</p>

  {#if $sessionStore.workoutType === 'amrap'}
    <div class="mb-8 p-6 rounded-3xl bg-[var(--text-color)]/[0.02] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] max-w-xs w-full space-y-6">
      <div class="text-[10px] xs:text-xs font-bold text-cyan-500 uppercase tracking-widest text-center">{$t('adjustScore')}</div>
      
      <!-- Rounds Control Row -->
      <div class="flex items-center justify-between gap-4">
        <button 
          type="button"
          onclick={() => adjustAmrapRounds(-1)}
          class="w-11 h-11 rounded-full border border-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/10 active:scale-95 transition-all text-cyan-400 text-xl font-light cursor-pointer select-none"
          aria-label="Decrease Rounds"
        >
          &minus;
        </button>
        <div class="flex flex-col items-center select-none">
          <span class="text-3xl font-extrabold text-white tabular-nums">{$sessionStore.amrapRoundsCompleted ?? 0}</span>
          <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{$t('rounds')}</span>
        </div>
        <button 
          type="button"
          onclick={() => adjustAmrapRounds(1)}
          class="w-11 h-11 rounded-full border border-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/10 active:scale-95 transition-all text-cyan-400 text-xl font-light cursor-pointer select-none"
          aria-label="Increase Rounds"
        >
          &#43;
        </button>
      </div>

      <!-- Divider -->
      <div class="h-px bg-cyan-500/10"></div>

      <!-- Reps Control Row -->
      <div class="flex items-center justify-between gap-4">
        <button 
          type="button"
          onclick={() => adjustReps(-1)}
          class="w-11 h-11 rounded-full border border-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/10 active:scale-95 transition-all text-cyan-400 text-xl font-light cursor-pointer select-none"
          aria-label="Decrease Reps"
        >
          &minus;
        </button>
        <div class="flex flex-col items-center select-none">
          <span class="text-2xl font-bold text-white tabular-nums">{$sessionStore.currentRep ?? 0}</span>
          <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{$t('reps')}</span>
        </div>
        <button 
          type="button"
          onclick={() => adjustReps(1)}
          class="w-11 h-11 rounded-full border border-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/10 active:scale-95 transition-all text-cyan-400 text-xl font-light cursor-pointer select-none"
          aria-label="Increase Reps"
        >
          &#43;
        </button>
      </div>
    </div>
  {:else if $sessionStore.workoutType === 'tabata'}
    <div class="mb-8 p-6 rounded-3xl bg-[var(--text-color)]/[0.02] border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)] max-w-xs w-full space-y-6">
      <div class="text-[10px] xs:text-xs font-bold text-orange-500 uppercase tracking-widest text-center">{$t('adjustScore')}</div>
      
      <!-- Total Reps Control Row -->
      <div class="flex items-center justify-between gap-4">
        <button 
          type="button"
          onclick={() => adjustReps(-1)}
          class="w-11 h-11 rounded-full border border-orange-500/20 flex items-center justify-center hover:bg-orange-500/10 active:scale-95 transition-all text-orange-400 text-xl font-light cursor-pointer select-none"
          aria-label="Decrease Reps"
        >
          &minus;
        </button>
        <div class="flex flex-col items-center select-none">
          <span class="text-3xl font-extrabold text-white tabular-nums">{$sessionStore.currentRep ?? 0}</span>
          <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{$t('totalReps')}</span>
        </div>
        <button 
          type="button"
          onclick={() => adjustReps(1)}
          class="w-11 h-11 rounded-full border border-orange-500/20 flex items-center justify-center hover:bg-orange-500/10 active:scale-95 transition-all text-orange-400 text-xl font-light cursor-pointer select-none"
          aria-label="Increase Reps"
        >
          &#43;
        </button>
      </div>
    </div>
  {:else if $sessionStore.workoutType === 'emom'}
    <div class="mb-8 p-6 rounded-3xl bg-[var(--text-color)]/[0.02] border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] max-w-xs w-full space-y-6">
      <div class="text-[10px] xs:text-xs font-bold text-emerald-500 uppercase tracking-widest text-center">{$t('adjustScore')}</div>
      
      <!-- Total Reps Control Row -->
      <div class="flex items-center justify-between gap-4">
        <button 
          type="button"
          onclick={() => adjustReps(-1)}
          class="w-11 h-11 rounded-full border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/10 active:scale-95 transition-all text-emerald-400 text-xl font-light cursor-pointer select-none"
          aria-label="Decrease Reps"
        >
          &minus;
        </button>
        <div class="flex flex-col items-center select-none">
          <span class="text-3xl font-extrabold text-white tabular-nums">{$sessionStore.currentRep ?? 0}</span>
          <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{$t('totalReps')}</span>
        </div>
        <button 
          type="button"
          onclick={() => adjustReps(1)}
          class="w-11 h-11 rounded-full border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/10 active:scale-95 transition-all text-emerald-400 text-xl font-light cursor-pointer select-none"
          aria-label="Increase Reps"
        >
          &#43;
        </button>
      </div>
    </div>
  {/if}
  
  <div class="space-y-4 w-full max-w-xs z-10 shrink-0">
    <button 
      onclick={restart}
      class="w-full bg-[var(--text-color)] text-[var(--bg-color)] font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity cursor-pointer select-none"
    >
      {$t('restartPreset')}
    </button>
    <button 
      onclick={onMenu}
      class="w-full border border-[var(--text-color)]/10 bg-[var(--text-color)]/[0.02] text-[var(--text-color)] font-bold py-4 rounded-2xl hover:bg-[var(--text-color)]/5 transition-colors cursor-pointer select-none"
    >
      {$t('backToMenu')}
    </button>
  </div>
</div>
