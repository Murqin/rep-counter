<script lang="ts">
  import { sessionStore } from '../store';
  import { fade, scale } from 'svelte/transition';
  
  let { onMenu }: { onMenu: () => void } = $props();

  function restart() {
    sessionStore.update(s => ({ 
      ...s, 
      currentRound: 1, 
      currentRep: 0, 
      isResting: false,
      timeLeft: 0,
      lastTick: null
    }));
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
  
  <h1 class="text-4xl font-light mb-2 tracking-tight">Session Complete</h1>
  <p class="text-gray-500 uppercase tracking-widest text-xs mb-16 font-bold">You've reached your goal</p>
  
  <div class="space-y-4 w-full max-w-xs">
    <button 
      onclick={restart}
      class="w-full bg-[var(--text-color)] text-[var(--bg-color)] font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity"
    >
      RESTART PRESET
    </button>
    <button 
      onclick={onMenu}
      class="w-full border border-[var(--text-color)]/10 bg-[var(--text-color)]/[0.02] text-[var(--text-color)] font-bold py-4 rounded-2xl hover:bg-[var(--text-color)]/5 transition-colors"
    >
      BACK TO MENU
    </button>
  </div>
</div>
