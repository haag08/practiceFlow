<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import TabBar from '$lib/components/TabBar.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	let { children } = $props();

	// Protected Routes Logic
	$effect(() => {
		if (!authStore.loading && !authStore.isAuthenticated && page.url.pathname !== base + '/login') {
			goto(base + '/login');
		}
	});

	const isLoginPage = $derived(page.url.pathname === base + '/login');
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if authStore.loading}
	<div class="min-h-screen bg-[#0a0f1d] flex items-center justify-center">
		<div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
	</div>
{:else}
	<div class="min-h-screen {isLoginPage ? '' : 'pb-28'}">
		{@render children()}
	</div>

	{#if !isLoginPage}
		<TabBar />
	{/if}
{/if}
