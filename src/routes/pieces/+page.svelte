<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { authStore } from '$lib/stores/auth.svelte';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';

  // State
  let loading = false;
  let folders: string[] = [];
  let files: any[] = [];
  let newFolderName = '';
  let selectedFolder: string | null = null;
  let uploadFile: File | null = null;

  // Ensure user is logged in
  $: if (!authStore.user) {
    // redirect to login if needed (simple approach)
    window.location.href = '/login';
  }

  async function refreshFolders() {
    loading = true;
    const { data, error } = await supabase.storage.from('pieces').list('');
    if (error) {
      console.error('Error listing folders', error);
    } else {
      // Supabase returns both files and folders; folders have a trailing '/' in name
      folders = (data ?? [])
        .filter((item: any) => item.type === 'folder')
        .map((item: any) => item.name.replace(/\/$/, ''));
    }
    loading = false;
  }

  async function selectFolder(folder: string) {
    selectedFolder = folder;
    await loadFiles(folder);
  }

  async function loadFiles(folder: string) {
    loading = true;
    const { data, error } = await supabase.storage.from('pieces').list(folder);
    if (error) {
      console.error('Error listing files', error);
      files = [];
    } else {
      files = data ?? [];
    }
    loading = false;
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    // Supabase creates a folder when uploading a placeholder file
    const placeholderPath = `${newFolderName.trim()}/.keep`;
    const { error } = await supabase.storage.from('pieces').upload(placeholderPath, new File([''], '.keep'));
    if (error) {
      console.error('Error creating folder', error);
    } else {
      newFolderName = '';
      await refreshFolders();
    }
  }

  async function handleUpload() {
    if (!selectedFolder || !uploadFile) return;
    const path = `${selectedFolder}/${uploadFile.name}`;
    const { error } = await supabase.storage.from('pieces').upload(path, uploadFile);
    if (error) {
      console.error('Upload error', error);
    } else {
      uploadFile = null;
      await loadFiles(selectedFolder);
    }
  }

  onMount(() => {
    refreshFolders();
  });
</script>

<style>
  .folder-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>

<div class="p-4 min-h-screen animate-fade-in">
  <SectionHeader title="My Sheet Music" subtitle="Upload and organise your pieces" />

  <!-- Folder creation -->
  <div class="flex gap-2 items-center mb-4">
    <input
      type="text"
      placeholder="New folder name"
      bind:value={newFolderName}
      class="flex-1 p-2 border rounded bg-surface-container-high text-on-surface focus:outline-none"
    />
    <Button on:click={createFolder} class="!rounded-full">Create Folder</Button>
  </div>

  {#if loading}
    <p class="text-on-surface-variant">Loading...</p>
  {/if}

  <!-- Folder list -->
  <div class="folder-list mb-6">
    {#each folders as folder}
      <Card
        level={1}
        class="cursor-pointer hover:bg-surface-container-high transition-colors"
        on:click={() => selectFolder(folder)}
      >
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h4l3 5h11"/></svg>
          <span class="text-on-surface font-medium">{folder}</span>
        </div>
      </Card>
    {/each}
  </div>

  {#if selectedFolder}
    <h2 class="text-2xl font-display font-bold text-on-surface mb-2">Folder: {selectedFolder}</h2>

    <!-- File upload -->
    <div class="flex items-center gap-2 mb-4">
      <input type="file" bind:files={uploadFile} class="p-2 border rounded bg-surface-container-high" />
      <Button on:click={handleUpload} disabled={!uploadFile}>Upload</Button>
    </div>

    <!-- Files in folder -->
    <div class="file-list">
      {#each files as f}
        <a
          href={supabase.storage.from('pieces').getPublicUrl(`${selectedFolder}/${f.name}`).publicURL}
          target="_blank"
          class="text-primary underline"
        >{f.name}</a>
      {/each}
      {#if files.length === 0}
        <p class="text-on-surface-variant">No files in this folder.</p>
      {/if}
    </div>
  {/if}
</div>
