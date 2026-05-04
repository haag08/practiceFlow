<script lang="ts">
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';
</script>

<div class="p-4 pt-12">
  <SectionHeader title="Profile" subtitle="Manage your account" />
  
  <Card class="mt-8">
    <div class="flex items-center gap-4 mb-6">
      <div class="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-primary text-2xl font-display font-bold">
        PF
      </div>
      <div>
        <h3 class="text-xl font-display text-on-surface">Musician</h3>
        <p class="text-on-surface-variant text-sm">Pro Member</p>
      </div>
    </div>
  </Card>
</div>
