<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';

	// Import defineCustomElements to register Stencil web components
	if (browser) {
		import('@mdaaquibkhan/recipe-ui-components/loader').then(({ defineCustomElements }) => {
			defineCustomElements(window);
		});
	}

	let { children } = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/recipes">My Recipes</a>
	<a href="/planner">Planner</a>
	<a href="/favourite">Favorites</a>
</nav>
<main>
	{@render children()}
</main>

<style>
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
