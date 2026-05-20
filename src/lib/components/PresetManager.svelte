<script lang="ts">
  import { presetsStore, sessionStore, settingsStore, wakeLockActive } from '../store';
  import { t } from '../i18n';
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
    // Bug #10: Validate numeric bounds
    if (newRounds < 1 || newReps < 1 || newBreak < 0) return;
    
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
      isTransitioning: false, // Bug #5b: clear any stale transition state
      timeLeft: 0,
      lastTick: null
    }));
    onclose();
  }

  function deletePreset(id: string, e: MouseEvent) {
    e.stopPropagation();
    presetsStore.update(p => p.filter(preset => preset.id !== id));
    if ($sessionStore.activePresetId === id) {
      // Bug #5: Reset full session state, not just activePresetId
      sessionStore.update(s => ({
        ...s,
        activePresetId: null,
        currentRound: 1,
        currentRep: 0,
        isResting: false,
        isTransitioning: false,
        timeLeft: 0,
        lastTick: null
      }));
    }
  }

  function toggleTheme() {
    settingsStore.update(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
  }

  function toggleFeedback() {
    settingsStore.update(s => ({ ...s, enableFeedback: !s.enableFeedback }));
  }

  function toggleLang() {
    settingsStore.update(s => ({ ...s, lang: s.lang === 'tr' ? 'en' : 'tr' }));
  }
</script>

<div 
  transition:fade={{ duration: 200 }}
  class="fixed inset-0 z-50 flex items-start justify-center bg-[var(--bg-color)]/80 backdrop-blur-sm p-4 pt-8 md:pt-12 overflow-y-auto"
>
  <div 
    transition:fly={{ y: 20, duration: 300 }}
    class="w-full max-w-lg bg-[var(--bg-color)] border border-[var(--text-color)]/10 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative mb-8"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-light tracking-tight">{$t('settings')}</h2>
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
      <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest">{$t('preferences')}</h3>
      
      <div class="flex items-center justify-between p-4 rounded-xl border border-[var(--text-color)]/5 bg-[var(--text-color)]/[0.02]">
        <div class="text-sm font-medium">{$t('theme')}</div>
        <button 
          onclick={toggleTheme}
          class="flex items-center gap-2 px-4 py-2 bg-[var(--text-color)]/5 hover:bg-[var(--text-color)]/10 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider border border-[var(--text-color)]/10"
        >
          {#if $settingsStore.theme === 'dark'}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            {$t('dark')}
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            {$t('light')}
          {/if}
        </button>
      </div>

      <div class="flex items-center justify-between p-4 rounded-xl border border-[var(--text-color)]/5 bg-[var(--text-color)]/[0.02]">
        <div class="text-sm font-medium">{$t('soundHaptics')}</div>
        <button 
          onclick={toggleFeedback}
          aria-label="Toggle Feedback"
          class="relative w-12 h-6 rounded-full transition-colors {$settingsStore.enableFeedback ? 'bg-[var(--text-color)]' : 'bg-[var(--text-color)]/10'}"
        >
          <div class="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform {$settingsStore.enableFeedback ? 'translate-x-6 bg-[var(--bg-color)]' : 'translate-x-0 bg-gray-500'}"></div>
        </button>
      </div>

      <div class="flex items-center justify-between p-4 rounded-xl border border-[var(--text-color)]/5 bg-[var(--text-color)]/[0.02]">
        <div>
          <div class="text-sm font-medium">{$t('screenWakeLock')}</div>
          <div class="text-[10px] text-gray-500 mt-0.5">{$t('wakeLockDescription')}</div>
        </div>
        <div class="flex items-center gap-2">
          {#if $wakeLockActive}
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {$t('active')}
            </span>
          {:else}
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-500/10 text-gray-400 border border-gray-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
              {$t('inactive')}
            </span>
          {/if}
        </div>
      </div>

      <!-- Language Selector -->
      <div class="flex items-center justify-between p-4 rounded-xl border border-[var(--text-color)]/5 bg-[var(--text-color)]/[0.02]">
        <div class="text-sm font-medium">{$t('language')}</div>
        <button 
          onclick={toggleLang}
          class="flex items-center gap-2 px-4 py-2 bg-[var(--text-color)]/5 hover:bg-[var(--text-color)]/10 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider border border-[var(--text-color)]/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          {$settingsStore.lang === 'tr' ? $t('turkish') : $t('english')}
        </button>
      </div>
    </div>

    <!-- Preset List -->
    <div class="space-y-4">
      <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest">{$t('presets')}</h3>
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
                {preset.rounds} {$t('rounds')} • {preset.repsPerRound} {$t('reps')} • {preset.breakDuration}{$t('break')}
              </div>
            </div>
            <div class="flex items-center gap-2">
              {#if $sessionStore.activePresetId === preset.id}
                <div class="w-2 h-2 rounded-full bg-[var(--text-color)] mr-2"></div>
              {/if}
              <button 
                onclick={(e) => editPreset(preset, e)}
                class="p-2 hover:text-[var(--text-color)] transition-all md:opacity-0 md:group-hover:opacity-100"
                aria-label="Edit preset"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button 
                onclick={(e) => deletePreset(preset.id, e)}
                class="p-2 hover:text-red-400 transition-all md:opacity-0 md:group-hover:opacity-100"
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
          {editingId ? $t('editPreset') : $t('newPreset')}
        </h3>
        {#if editingId}
          <button 
            onclick={resetForm}
            class="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--text-color)]"
          >
            {$t('cancelEdit')}
          </button>
        {/if}
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2 space-y-1.5">
          <label for="preset-name" class="text-[10px] font-bold text-gray-600 uppercase tracking-wider ml-1">{$t('name')}</label>
          <input 
            id="preset-name"
            type="text" 
            bind:value={newName} 
            placeholder={$t('routineNamePlaceholder')} 
            class="w-full bg-[var(--text-color)]/[0.03] border border-[var(--text-color)]/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--text-color)]/30 transition-colors text-[var(--text-color)]"
          />
        </div>
        <div class="space-y-1.5">
          <label for="preset-rounds" class="text-[10px] font-bold text-gray-600 uppercase tracking-wider ml-1">{$t('roundsLabel')}</label>
          <input 
            id="preset-rounds"
            type="number"
            min="1"
            bind:value={newRounds} 
            class="w-full bg-[var(--text-color)]/[0.03] border border-[var(--text-color)]/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--text-color)]/30 transition-colors text-[var(--text-color)]"
          />
        </div>
        <div class="space-y-1.5">
          <label for="preset-reps" class="text-[10px] font-bold text-gray-600 uppercase tracking-wider ml-1">{$t('repsLabel')}</label>
          <input 
            id="preset-reps"
            type="number"
            min="1"
            bind:value={newReps} 
            class="w-full bg-[var(--text-color)]/[0.03] border border-[var(--text-color)]/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--text-color)]/30 transition-colors text-[var(--text-color)]"
          />
        </div>
        <div class="space-y-1.5">
          <label for="preset-break" class="text-[10px] font-bold text-gray-600 uppercase tracking-wider ml-1">{$t('breakLabel')}</label>
          <input 
            id="preset-break"
            type="number"
            min="0"
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
        {editingId ? $t('saveChanges') : $t('createPreset')}
      </button>
    </div>

    <!-- Community Section -->
    <div class="pt-8 border-t border-[var(--text-color)]/5 space-y-6">
      <div class="text-center space-y-2">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest">{$t('supportCommunity')}</h3>
        <p class="text-xs text-gray-600 px-4">{$t('enjoyApp')}</p>
      </div>
      
      <div class="flex flex-col gap-3">
        <a 
          href="https://buymeacoffee.com/murqin" 
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-3 w-full bg-[#FFDD00] hover:bg-[#FFCC00] text-black py-3.5 rounded-xl transition-all font-bold group shadow-lg"
        >
          <img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Buy Me A Coffee" class="w-5 h-5" />
          {$t('buyMeCoffee')}
        </a>

        <a 
          href="https://github.com/Murqin/rep-counter" 
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-3 w-full bg-[#161b22] hover:bg-[#1f242c] text-white py-3.5 rounded-xl transition-all font-medium border border-white/5 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:text-yellow-400 transition-colors"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          {$t('starOnGithub')}
        </a>
        
        <a 
          href="https://github.com/Murqin/rep-counter/issues" 
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-3 w-full bg-[var(--text-color)]/5 hover:bg-[var(--text-color)]/10 text-gray-400 hover:text-[var(--text-color)] py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
        >
          {$t('reportBug')}
        </a>
      </div>
      
      <div class="text-[10px] text-gray-700 text-center font-bold tracking-widest uppercase pb-4">
        {$t('version')}
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
