<script lang="ts">
  import { presetsStore, sessionStore } from '../store';
  import type { Preset } from '../types';
  import { fade, fly } from 'svelte/transition';

  let { onclose }: { onclose: () => void } = $props();

  let newName = $state('');
  let newRounds = $state(5);
  let newReps = $state(10);
  let newBreak = $state(30);
  let editingId = $state<string | null>(null);

  function resetForm() {
    editingId = null;
    newName = '';
    newRounds = 5;
    newReps = 10;
    newBreak = 30;
  }

  function savePreset() {
    if (!newName.trim()) return;
    
    if (editingId) {
      presetsStore.update(p => p.map(preset => 
        preset.id === editingId 
          ? { ...preset, name: newName, rounds: newRounds, repsPerRound: newReps, breakDuration: newBreak }
          : preset
      ));
    } else {
      const newPreset: Preset = {
        id: crypto.randomUUID(),
        name: newName,
        rounds: newRounds,
        repsPerRound: newReps,
        breakDuration: newBreak
      };
      presetsStore.update(p => [...p, newPreset]);
    }
    
    resetForm();
  }

  function editPreset(preset: Preset, e: MouseEvent) {
    e.stopPropagation();
    editingId = preset.id;
    newName = preset.name;
    newRounds = preset.rounds;
    newReps = preset.repsPerRound;
    newBreak = preset.breakDuration;
    
    // Scroll form into view if needed
    const formElement = document.getElementById('preset-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function selectPreset(preset: Preset) {
    sessionStore.update(s => ({
      ...s,
      activePresetId: preset.id,
      totalRounds: preset.rounds,
      currentRound: 1,
      currentRep: 0,
      isResting: false
    }));
    onclose();
  }

  function deletePreset(id: string, e: MouseEvent) {
    e.stopPropagation();
    presetsStore.update(p => p.filter(preset => preset.id !== id));
    if ($sessionStore.activePresetId === id) {
      sessionStore.update(s => ({ ...s, activePresetId: null }));
    }
  }
</script>

<div 
  transition:fade={{ duration: 200 }}
  class="fixed inset-0 z-50 flex items-center justify-center bg-black p-4 md:p-8 overflow-y-auto"
>
  <div 
    transition:fly={{ y: 20, duration: 300 }}
    class="w-full max-w-lg bg-black border border-white/10 rounded-2xl p-6 md:p-8 space-y-8"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-light tracking-tight">Presets</h2>
      <button 
        onclick={onclose}
        class="p-2 hover:bg-white/5 rounded-full transition-colors"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>

    <!-- Preset List -->
    <div class="space-y-3">
      {#each $presetsStore as preset (preset.id)}
        <div 
          role="button"
          tabindex="0"
          onclick={() => selectPreset(preset)}
          onkeydown={(e) => e.key === 'Enter' && selectPreset(preset)}
          class="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group cursor-pointer {$sessionStore.activePresetId === preset.id ? 'border-white/20 bg-white/[0.08]' : ''}"
        >
          <div class="text-left">
            <div class="font-medium">{preset.name}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">
              {preset.rounds} rounds • {preset.repsPerRound} reps • {preset.breakDuration}s break
            </div>
          </div>
          <div class="flex items-center gap-2">
            {#if $sessionStore.activePresetId === preset.id}
              <div class="w-2 h-2 rounded-full bg-white mr-2"></div>
            {/if}
            <button 
              onclick={(e) => editPreset(preset, e)}
              class="opacity-0 group-hover:opacity-100 p-2 hover:text-white transition-all"
              aria-label="Edit preset"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button 
              onclick={(e) => deletePreset(preset.id, e)}
              class="opacity-0 group-hover:opacity-100 p-2 hover:text-red-400 transition-all"
              aria-label="Delete preset"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Add/Edit Preset Form -->
    <div id="preset-form" class="pt-6 border-t border-white/5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest">
          {editingId ? 'Edit Preset' : 'New Preset'}
        </h3>
        {#if editingId}
          <button 
            onclick={resetForm}
            class="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-white"
          >
            Cancel Edit
          </button>
        {/if}
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2 space-y-1.5">
          <label for="preset-name" class="text-[10px] font-bold text-gray-600 uppercase tracking-wider ml-1">Name</label>
          <input 
            id="preset-name"
            type="text" 
            bind:value={newName} 
            placeholder="Routine name..." 
            class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-white/30 transition-colors text-white"
          />
        </div>
        <div class="space-y-1.5">
          <label for="preset-rounds" class="text-[10px] font-bold text-gray-600 uppercase tracking-wider ml-1">Rounds</label>
          <input 
            id="preset-rounds"
            type="number" 
            bind:value={newRounds} 
            class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-white/30 transition-colors text-white"
          />
        </div>
        <div class="space-y-1.5">
          <label for="preset-reps" class="text-[10px] font-bold text-gray-600 uppercase tracking-wider ml-1">Reps</label>
          <input 
            id="preset-reps"
            type="number" 
            bind:value={newReps} 
            class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-white/30 transition-colors text-white"
          />
        </div>
        <div class="space-y-1.5">
          <label for="preset-break" class="text-[10px] font-bold text-gray-600 uppercase tracking-wider ml-1">Break (s)</label>
          <input 
            id="preset-break"
            type="number" 
            bind:value={newBreak} 
            class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-white/30 transition-colors text-white"
          />
        </div>
      </div>
      <button 
        onclick={savePreset}
        disabled={!newName.trim()}
        class="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-all mt-2"
      >
        {editingId ? 'Save Changes' : 'Create Preset'}
      </button>
    </div>
  </div>
</div>

<style>
  div::-webkit-scrollbar {
    width: 4px;
  }
  div::-webkit-scrollbar-track {
    background: transparent;
  }
  div::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
</style>
