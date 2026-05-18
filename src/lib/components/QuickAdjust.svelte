<!-- src/lib/components/QuickAdjust.svelte -->
<script lang="ts">
  import { sessionStore } from '../store';
  import { fade, fly } from 'svelte/transition';

  let { onclose, targetReps, onUpdateTarget }: { 
    onclose: () => void, 
    targetReps: number, 
    onUpdateTarget: (val: number) => void 
  } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  transition:fade={{ duration: 200 }}
  class="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
  onclick={onclose}
>
  <div 
    transition:fly={{ y: 300, duration: 300 }}
    class="w-full max-w-lg bg-[#0A0A0A] border-t border-white/10 rounded-t-3xl p-8 pb-12 space-y-10"
    onclick={(e) => e.stopPropagation()}
  >
    <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2"></div>
    
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Target Reps</div>
          <div class="text-3xl font-light">{targetReps}</div>
        </div>
        <div class="flex gap-4">
          <button 
            onclick={() => onUpdateTarget(Math.max(1, Number(targetReps) - 1))}
            class="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-2xl active:bg-white/5"
          >−</button>
          <button 
            onclick={() => onUpdateTarget(Number(targetReps) + 1)}
            class="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-2xl active:bg-white/5"
          >+</button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Rounds</div>
          <div class="text-3xl font-light">{$sessionStore.totalRounds}</div>
        </div>
        <div class="flex gap-4">
          <button 
            onclick={() => sessionStore.update(s => ({ ...s, totalRounds: Math.max(1, Number(s.totalRounds) - 1) }))}
            class="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-2xl active:bg-white/5"
          >−</button>
          <button 
            onclick={() => sessionStore.update(s => ({ ...s, totalRounds: Number(s.totalRounds) + 1 }))}
            class="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-2xl active:bg-white/5"
          >+</button>
        </div>
      </div>
    </div>

    <button 
      onclick={onclose}
      class="w-full bg-white text-black font-bold py-4 rounded-2xl"
    >
      DONE
    </button>
  </div>
</div>
