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

<div class="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-color)] text-[var(--text-color)]">
  <div class="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">BREAK</div>
  <div class="text-8xl font-light tabular-nums text-gray-300">{minutes}:{seconds}</div>
  <button 
    class="mt-12 px-8 py-3 bg-[var(--text-color)] text-[var(--bg-color)] font-bold text-sm rounded hover:opacity-80 transition-colors"
    onclick={endRest}
  >
    SKIP BREAK
  </button>
</div>
