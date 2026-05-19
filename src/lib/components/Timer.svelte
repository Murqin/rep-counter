<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { sessionStore, endRest, updateTimer } from '../store';

  let { duration }: { duration: number } = $props();
  let interval: ReturnType<typeof setInterval>;

  onMount(() => {
    // If timeLeft is not set, initialize it
    if ($sessionStore.timeLeft <= 0) {
      sessionStore.update(s => ({ ...s, timeLeft: duration, lastTick: Date.now() }));
    }

    interval = setInterval(() => {
      updateTimer();
      if ($sessionStore.timeLeft <= 0) {
        clearInterval(interval);
        endRest();
      }
    }, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  let minutes = $derived(Math.floor($sessionStore.timeLeft / 60).toString().padStart(2, '0'));
  let seconds = $derived(($sessionStore.timeLeft % 60).toString().padStart(2, '0'));
</script>

<div class="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-color)] text-[var(--text-color)] select-none p-4">
  <div 
    class="flex flex-col items-center justify-center rounded-full border border-[var(--text-color)]/10 bg-transparent relative"
    style="height: min(85vw, 65vh, 400px); width: min(85vw, 65vh, 400px); max-height: 400px; max-width: 400px;"
  >
    <div class="text-[10px] xs:text-sm font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">BREAK</div>
    <div class="text-[6rem] xs:text-[7rem] sm:text-[8rem] font-light tabular-nums tracking-tighter text-[var(--text-color)]">{minutes}:{seconds}</div>
    
    <button 
      class="mt-8 text-[8px] xs:text-[10px] font-bold tracking-[0.2em] text-[var(--text-color)]/30 hover:text-[var(--text-color)] transition-all border border-[var(--text-color)]/10 px-4 xs:px-6 py-2 rounded-full active:scale-95"
      onclick={endRest}
    >
      SKIP BREAK
    </button>
  </div>
</div>
