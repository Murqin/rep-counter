<script lang="ts">
  import { presetsStore, sessionStore, settingsStore } from '../store';
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
      isResting: false,
      timeLeft: 0,
      lastTick: null
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

  function toggleTheme() {
    settingsStore.update(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
  }

  function toggleFeedback() {
    settingsStore.update(s => ({ ...s, enableFeedback: !s.enableFeedback }));
  }
</script>

<div 
  transition:fade={{ duration: 200 }}
  class="fixed inset-0 z-50 flex items-start justify-center bg-[var(--bg-color)] overflow-y-auto"
>
  <div 
    transition:fly={{ y: 20, duration: 300 }}
    class="w-full max-w-lg bg-[var(--bg-color)] border-x border-b border-[var(--text-color)]/10 rounded-b-2xl p-6 md:p-8 space-y-8 mb-8"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-light tracking-tight">Settings</h2>
      <button 
        onclick={onclose}
        class="p-2 hover:bg-[var(--text-color)]/5 rounded-full transition-colors"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>

    <!-- App Settings -->
    <div class="space-y-4">
      <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest">Preferences</h3>
      
      <div class="flex items-center justify-between p-4 rounded-xl border border-[var(--text-color)]/5 bg-[var(--text-color)]/[0.02]">
        <div class="text-sm font-medium">Theme</div>
        <button 
          onclick={toggleTheme}
          class="flex items-center gap-2 px-4 py-2 bg-[var(--text-color)]/5 hover:bg-[var(--text-color)]/10 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider border border-[var(--text-color)]/10"
        >
          {#if $settingsStore.theme === 'dark'}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            Dark
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            Light
          {/if}
        </button>
      </div>

      <div class="flex items-center justify-between p-4 rounded-xl border border-[var(--text-color)]/5 bg-[var(--text-color)]/[0.02]">
        <div class="text-sm font-medium">Sound & Haptics</div>
        <button 
          onclick={toggleFeedback}
          aria-label="Toggle Feedback"
          class="relative w-12 h-6 rounded-full transition-colors {$settingsStore.enableFeedback ? 'bg-[var(--text-color)]' : 'bg-[var(--text-color)]/10'}"
        >
          <div class="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform {$settingsStore.enableFeedback ? 'translate-x-6 bg-[var(--bg-color)]' : 'translate-x-0 bg-gray-500'}"></div>
        </button>
      </div>
    </div>

    <!-- Preset List -->
    <div class="space-y-4">
      <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest">Presets</h3>
      <div class="space-y-3">
        {#each $presetsStore as preset (preset.id)}
          <div 
            role="button"
            tabindex="0"
            onclick={() => selectPreset(preset)}
            onkeydown={(e) => e.key === 'Enter' && selectPreset(preset)}
            class="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--text-color)]/5 bg-[var(--text-color)]/[0.02] hover:bg-[var(--text-color)]/[0.05] transition-all group cursor-pointer {$sessionStore.activePresetId === preset.id ? 'border-[var(--text-color)]/20 bg-[var(--text-color)]/[0.08]' : ''}"
          >
            <div class="text-left">
              <div class="font-medium">{preset.name}</div>
              <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">
                {preset.rounds} rounds • {preset.repsPerRound} reps • {preset.breakDuration}s break
              </div>
            </div>
            <div class="flex items-center gap-2">
              {#if $sessionStore.activePresetId === preset.id}
                <div class="w-2 h-2 rounded-full bg-[var(--text-color)] mr-2"></div>
              {/if}
              <button 
                onclick={(e) => editPreset(preset, e)}
                class="opacity-0 group-hover:opacity-100 p-2 hover:text-[var(--text-color)] transition-all"
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
    </div>

    <!-- Add/Edit Preset Form -->
    <div id="preset-form" class="pt-6 border-t border-[var(--text-color)]/5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest">
          {editingId ? 'Edit Preset' : 'New Preset'}
        </h3>
        {#if editingId}
          <button 
            onclick={resetForm}
            class="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--text-color)]"
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
            class="w-full bg-[var(--text-color)]/[0.03] border border-[var(--text-color)]/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--text-color)]/30 transition-colors text-[var(--text-color)]"
          />
        </div>
        <div class="space-y-1.5">
          <label for="preset-rounds" class="text-[10px] font-bold text-gray-600 uppercase tracking-wider ml-1">Rounds</label>
          <input 
            id="preset-rounds"
            type="number" 
            bind:value={newRounds} 
            class="w-full bg-[var(--text-color)]/[0.03] border border-[var(--text-color)]/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--text-color)]/30 transition-colors text-[var(--text-color)]"
          />
        </div>
        <div class="space-y-1.5">
          <label for="preset-reps" class="text-[10px] font-bold text-gray-600 uppercase tracking-wider ml-1">Reps</label>
          <input 
            id="preset-reps"
            type="number" 
            bind:value={newReps} 
            class="w-full bg-[var(--text-color)]/[0.03] border border-[var(--text-color)]/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--text-color)]/30 transition-colors text-[var(--text-color)]"
          />
        </div>
        <div class="space-y-1.5">
          <label for="preset-break" class="text-[10px] font-bold text-gray-600 uppercase tracking-wider ml-1">Break (s)</label>
          <input 
            id="preset-break"
            type="number" 
            bind:value={newBreak} 
            class="w-full bg-[var(--text-color)]/[0.03] border border-[var(--text-color)]/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--text-color)]/30 transition-colors text-[var(--text-color)]"
          />
        </div>
      </div>
      <button 
        onclick={savePreset}
        disabled={!newName.trim()}
        class="w-full bg-[var(--text-color)] text-[var(--bg-color)] font-medium py-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:hover:opacity-50 transition-all mt-2"
      >
        {editingId ? 'Save Changes' : 'Create Preset'}
      </button>
    </div>

    <!-- Community Section -->
    <div class="pt-8 border-t border-[var(--text-color)]/5 space-y-6">
      <div class="text-center space-y-2">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest">Support & Community</h3>
        <p class="text-xs text-gray-600 px-4">If you enjoy this app, consider supporting it by giving a star on GitHub!</p>
      </div>
      
      <div class="flex flex-col gap-3">
        <a 
          href="https://github.com/Murqin/rep-counter" 
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-3 w-full bg-[#161b22] hover:bg-[#1f242c] text-white py-3.5 rounded-xl transition-all font-medium border border-white/5 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:text-yellow-400 transition-colors"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          Star on GitHub
        </a>
        
        <a 
          href="https://github.com/Murqin/rep-counter/issues" 
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-3 w-full bg-[var(--text-color)]/5 hover:bg-[var(--text-color)]/10 text-gray-400 hover:text-[var(--text-color)] py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
        >
          Report a Bug
        </a>
      </div>
      
      <div class="text-[10px] text-gray-700 text-center font-bold tracking-widest uppercase pb-4">
        Rep Counter v1.0.0
      </div>
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
