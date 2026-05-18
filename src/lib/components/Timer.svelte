<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { endRest } from '../store';

  let { duration }: { duration: number } = $props();
  let timeLeft = $state(0);
  let interval: ReturnType<typeof setInterval>;

  $effect(() => {
    timeLeft = duration;
  });

  onMount(() => {
    interval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(interval);
        endRest();
      }
    }, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  let minutes = $derived(Math.floor(timeLeft / 60).toString().padStart(2, '0'));
  let seconds = $derived((timeLeft % 60).toString().padStart(2, '0'));
</script>

<div class="flex flex-col items-center justify-center w-full h-full bg-black text-white">
  <div class="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">BREAK</div>
  <div class="text-8xl font-light tabular-nums text-gray-300">{minutes}:{seconds}</div>
  <button 
    class="mt-12 px-8 py-3 bg-white text-black font-bold text-sm rounded hover:bg-gray-200 transition-colors"
    onclick={endRest}
  >
    SKIP BREAK
  </button>
</div>
