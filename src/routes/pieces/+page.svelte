<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { dbService } from '$lib/services/dbService';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import { fade, slide } from 'svelte/transition';
  import { i18n } from '$lib/i18n.svelte';

  // State
  let loading = $state(true);
  let folders = $state<any[]>([]);
  let pieces = $state<any[]>([]);
  let currentFolderId = $state<string | null>(null);
  let currentFolderName = $state<string | null>(null);
  let showCreateFolder = $state(false);
  let newFolderName = $state('');
  let uploading = $state(false);
  let fileInput: HTMLInputElement;

  onMount(() => {
    loadData();
  });

  async function loadData() {
    if (!authStore.user) return;
    loading = true;
    
    const [foldersRes, piecesRes] = await Promise.all([
      dbService.getFolders(authStore.user.id),
      dbService.getPieces(authStore.user.id, currentFolderId)
    ]);

    if (foldersRes.data) folders = foldersRes.data;
    if (piecesRes.data) pieces = piecesRes.data;
    
    loading = false;
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim() || !authStore.user) return;
    
    const { data, error } = await dbService.createFolder(authStore.user.id, newFolderName);
    if (!error) {
      newFolderName = '';
      showCreateFolder = false;
      loadData();
    }
  }

  async function navigateToFolder(folder: any) {
    currentFolderId = folder.id;
    currentFolderName = folder.name;
    loadData();
  }

  async function navigateBack() {
    currentFolderId = null;
    currentFolderName = null;
    loadData();
  }

  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !authStore.user) return;

    uploading = true;
    const { error } = await dbService.uploadPieceFile(authStore.user.id, currentFolderId, file);
    uploading = false;

    if (!error) {
      loadData();
    }
  }

  async function handleDeletePiece(piece: any) {
    if (!confirm(`${i18n.t('common.delete')} "${piece.name}"?`)) return;
    const { error } = await dbService.deletePiece(piece.id, piece.storage_path);
    if (!error) loadData();
  }

  async function handleDeleteFolder(folder: any) {
    if (!confirm(`${i18n.t('common.delete')} "${folder.name}"?`)) return;
    const { error } = await dbService.deleteFolder(folder.id);
    if (!error) loadData();
  }

  function openFile(storagePath: string) {
    const { data } = dbService.getPiecePublicUrl(storagePath);
    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  }
</script>

<div class="p-4 pt-12 space-y-8 animate-fade-in pb-24 min-h-screen">
  <!-- Header & Breadcrumbs -->
  <div class="px-2">
    <SectionHeader 
      title={currentFolderName || i18n.t('pieces.title')} 
      subtitle={currentFolderName ? i18n.t('pieces.subtitle') : i18n.t('pieces.subtitle')} 
    />
    
    {#if currentFolderId}
      <button 
        onclick={navigateBack}
        class="mt-2 flex items-center gap-2 text-primary font-medium hover:opacity-80 transition-opacity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {i18n.t('common.back')}
      </button>
    {/if}
  </div>

  <!-- Actions -->
  <div class="px-2 flex flex-wrap gap-3">
    <Button 
      variant="primary" 
      class="!rounded-full flex items-center gap-2"
      onclick={() => fileInput.click()}
      disabled={uploading}
    >
      {#if uploading}
        <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        {i18n.t('common.upload')}...
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        {i18n.t('pieces.upload_piece')}
      {/if}
    </Button>
    <input 
      type="file" 
      bind:this={fileInput} 
      onchange={handleFileUpload} 
      class="hidden" 
    />

    {#if !currentFolderId}
      <Button 
        variant="secondary" 
        class="!rounded-full flex items-center gap-2"
        onclick={() => showCreateFolder = !showCreateFolder}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 4.5v15a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-3.938a1.5 1.5 0 01-1.06-.44l-2.122-2.12z" />
        </svg>
        {i18n.t('pieces.new_folder')}
      </Button>
    {/if}
  </div>

  <!-- Create Folder Form -->
  {#if showCreateFolder}
    <div class="px-2" transition:slide>
      <Card class="p-4 flex gap-3 items-center !rounded-2xl border border-white/5">
        <input 
          type="text" 
          bind:value={newFolderName}
          placeholder={i18n.t('pieces.folder_name')}
          class="flex-1 bg-surface-container-highest border-none rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary outline-none"
          onkeydown={(e) => e.key === 'Enter' && handleCreateFolder()}
        />
        <Button variant="primary" class="!rounded-xl" onclick={handleCreateFolder}>{i18n.t('common.create')}</Button>
        <Button variant="secondary" class="!rounded-xl" onclick={() => showCreateFolder = false}>{i18n.t('common.cancel')}</Button>
      </Card>
    </div>
  {/if}

  <!-- Content Grid -->
  <div class="px-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#if loading}
      {#each Array(6) as _}
        <div class="h-24 bg-surface-container-high/50 animate-pulse rounded-[2rem]"></div>
      {/each}
    {:else}
      <!-- Folders (only show in root) -->
      {#if !currentFolderId}
        {#each folders as folder}
          <div transition:fade>
            <Card 
              class="group relative flex items-center justify-between p-4 hover:bg-surface-container-high transition-all cursor-pointer !rounded-[2rem] border border-white/5"
              onclick={() => navigateToFolder(folder)}
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-6 h-6">
                    <path d="M19.5 21a3 3 0 003-3V9a3 3 0 00-3-3h-5.379a.75.75 0 01-.53-.22L11.47 3.66a2.25 2.25 0 00-1.591-.66H4.5A3 3 0 001.5 6v12a3 3 0 003 3h15z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-display font-medium text-on-surface text-lg">{folder.name}</h3>
                </div>
              </div>
              <button 
                onclick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                class="opacity-0 group-hover:opacity-100 p-2 text-on-surface-variant hover:text-error transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </Card>
          </div>
        {/each}
      {/if}

      <!-- Pieces -->
      {#each pieces as piece}
        <div transition:fade>
          <Card 
            class="group relative flex items-center justify-between p-4 hover:bg-surface-container-high transition-all cursor-pointer !rounded-[2rem] border border-white/5"
            onclick={() => openFile(piece.storage_path)}
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div class="overflow-hidden">
                <h3 class="font-display font-medium text-on-surface text-lg truncate pr-8">{piece.name}</h3>
                <p class="text-xs text-on-surface-variant opacity-60">{i18n.t('common.upload')} {new Date(piece.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <button 
              onclick={(e) => { e.stopPropagation(); handleDeletePiece(piece); }}
              class="opacity-0 group-hover:opacity-100 p-2 text-on-surface-variant hover:text-error transition-all absolute right-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </Card>
        </div>
      {/each}

      {#if !loading && folders.length === 0 && pieces.length === 0}
        <div class="col-span-full py-20 text-center space-y-4" in:fade>
          <div class="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-on-surface-variant opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p class="text-on-surface-variant font-medium">{i18n.t('pieces.empty_library')}</p>
          <p class="text-xs text-on-surface-variant opacity-60 max-w-xs mx-auto">{i18n.t('pieces.empty_hint')}</p>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
