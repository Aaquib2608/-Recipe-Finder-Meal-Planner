<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let { children } = $props();
	let componentsReady = $state(!browser); // true on server, false in browser until loaded

	onMount(async () => {
		// Import and register Stencil components
		const { defineCustomElements } = await import('@mdaaquibkhan/recipe-ui-components/loader');
		console.log('recipe-card registered?', !!customElements.get('recipe-card'));
		console.log('day-slot registered?', !!customElements.get('planner-card'));
		console.log('ui-modal registered?', !!customElements.get('recipe-overlay'));
		await defineCustomElements(window);
		componentsReady = true;
	});
</script>

<nav>
	<a href="{base}/">Home</a>
	<a href="{base}/recipes">My Recipes</a>
	<a href="{base}/planner">Planner</a>
	<a href="{base}/favourite">Favorites</a>
</nav>
<main>
	{#if componentsReady}
		{@render children()}
	{:else}
		<div class="loading">Loading...</div>
	{/if}
</main>

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 200px;
		color: #666;
	}

	/* Fix Stencil hydration visibility issue */
	:global(overlay-card),
	:global(planner-card),
	:global(recipe-card),
	:global(recipe-overlay) {
		visibility: visible !important;
	}

	body {
		font-family: system-ui, -apple-system, sans-serif;
	}

	nav {
		display: flex;
		gap: 2rem;
		padding: 1rem 10%;
		background-color: #333;
	}

	nav a {
		color: white;
		text-decoration: none;
		font-weight: 500;
	}

	nav a:hover {
		text-decoration: underline;
	}

	main {
		padding: 2rem 10%;
	}
</style>
