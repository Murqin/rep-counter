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
</script>

<div 
  transition:fade={{ duration: 300 }}
  class="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-color)] text-[var(--text-color)] p-8 text-center"
>
  <div 
    transition:scale={{ delay: 200, duration: 400 }}
    class="w-24 h-24 bg-[var(--text-color)] rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--bg-color)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  </div>
  
  <h1 class="text-4xl font-light mb-2 tracking-tight">{$t('sessionComplete')}</h1>
  <p class="text-gray-500 uppercase tracking-widest text-xs mb-8 font-bold">{$t('reachedGoal')}</p>

  {#if $sessionStore.workoutType === 'amrap'}
    <div class="mb-12 p-6 rounded-2xl bg-[var(--text-color)]/[0.02] border border-[var(--text-color)]/5 max-w-xs w-full">
      <div class="text-[10px] xs:text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">{$t('roundsCompleted')}</div>
      <div class="text-3xl xs:text-4xl font-extrabold tracking-tight text-white mb-1">
        {$sessionStore.amrapRoundsCompleted} {$t('rounds')}
      </div>
      <div class="text-xs text-gray-500 uppercase tracking-wider font-semibold">
        + {$sessionStore.currentRep} {$t('reps')}
      </div>
    </div>
  {/if}
  
  <div class="space-y-4 w-full max-w-xs z-10">
    <button 
      onclick={restart}
      class="w-full bg-[var(--text-color)] text-[var(--bg-color)] font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity cursor-pointer"
    >
      {$t('restartPreset')}
    </button>
    <button 
      onclick={onMenu}
      class="w-full border border-[var(--text-color)]/10 bg-[var(--text-color)]/[0.02] text-[var(--text-color)] font-bold py-4 rounded-2xl hover:bg-[var(--text-color)]/5 transition-colors cursor-pointer"
    >
      {$t('backToMenu')}
    </button>
  </div>
</div>
