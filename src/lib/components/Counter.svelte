<!-- src/lib/components/Counter.svelte -->
<script lang="ts">
  import { sessionStore } from '../store';
  import ClassicCounter from './ClassicCounter.svelte';
  import EmomCounter from './EmomCounter.svelte';
  import TabataCounter from './TabataCounter.svelte';
  import AmrapCounter from './AmrapCounter.svelte';
  
  let { 
    targetReps, 
    restDuration,
    onUpdateTarget,
    onUpdateRest,
    onOpenSettings 
  }: { 
    targetReps: number, 
    restDuration: number,
    onUpdateTarget: (val: number) => void,
    onUpdateRest: (val: number) => void,
    onOpenSettings: () => void 
  } = $props();

  let workoutType = $derived($sessionStore.workoutType || 'classic');
</script>

{#if workoutType === 'classic'}
  <ClassicCounter 
    {targetReps} 
    {restDuration} 
    {onUpdateTarget} 
    {onUpdateRest} 
    {onOpenSettings} 
  />
{:else if workoutType === 'emom'}
  <EmomCounter 
    {targetReps} 
    {restDuration} 
    {onUpdateTarget} 
    {onUpdateRest} 
    {onOpenSettings} 
  />
{:else if workoutType === 'tabata'}
  <TabataCounter 
    {targetReps} 
    {restDuration} 
    {onOpenSettings} 
  />
{:else if workoutType === 'amrap'}
  <AmrapCounter 
    {targetReps} 
    {restDuration} 
    {onUpdateTarget} 
    {onUpdateRest} 
    {onOpenSettings} 
  />
{/if}

