<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import TabBar from '$lib/components/TabBar.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { settingsStore } from '$lib/stores/settings.svelte';

	let { children } = $props();

	// Theme Logic
	$effect(() => {
		if (typeof document !== 'undefined') {
			if (!settingsStore.settings.dark_mode) {
				document.documentElement.classList.add('light-theme');
			} else {
				document.documentElement.classList.remove('light-theme');
			}
		}
	});

	// Protected Routes Logic
	$effect(() => {
		if (!authStore.loading && !authStore.isAuthenticated && page.url.pathname !== base + '/login') {
			goto(base + '/login');
		}
	});

	const isLoginPage = $derived(page.url.pathname === base + '/login');
</script>

<svelte:head>
	<title>Practice Flow</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if authStore.loading}
<div class="min-h-screen bg-surface flex items-center justify-center">
		<div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
	</div>
{:else}
	<div class="min-h-screen {isLoginPage ? '' : 'pb-28 lg:pb-0 lg:pl-64'}">
		{@render children()}
	</div>

	{#if !isLoginPage}
		<TabBar />
	{/if}
{/if}
