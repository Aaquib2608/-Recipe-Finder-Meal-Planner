<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	// Import defineCustomElements to register Stencil web components
	onMount(async () => {
		if (browser) {
			const { defineCustomElements } = await import('@mdaaquibkhan/recipe-ui-components/loader');
			defineCustomElements(window);
		}
	});

	let { children } = $props();
</script>

<nav>
	<a href="{base}/">Home</a>
	<a href="{base}/recipes">My Recipes</a>
	<a href="{base}/planner">Planner</a>
	<a href="{base}/favourite">Favorites</a>
</nav>
<main>
	{@render children()}
</main>

<style>
	/* Fix Stencil hydration visibility issue */
	:global(overlay-card),
	:global(planner-card),
	:global(recipe-card),
	:global(recipe-overlay) {
		visibility: visible !important;
	}

	:global(body) {
		margin: 0;
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
