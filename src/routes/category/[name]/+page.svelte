<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	function handleRecipeSelect(event: CustomEvent) {
		const mealId = event.detail.id;
		goto(`/meal/${mealId}`);
	}

	function handleToggleFavorite(event: CustomEvent) {
		console.log('Favorite toggled:', event.detail);
	}
</script>

<svelte:head>
	<title>{data.categoryName} Recipes | Recipe Finder</title>
</svelte:head>

<main>
	<a href="/" class="back-link">← Back to Categories</a>
	<h1>{data.categoryName} Recipes</h1>

	{#if data.meals.length === 0}
		<p class="no-meals">No meals found in this category.</p>
	{:else}
		<div class="grid">
			{#each data.meals as meal}
				<recipe-card
					recipe-id={meal.idMeal}
					recipe-title={meal.strMeal}
					image={meal.strMealThumb}
					url={`/meal/${meal.idMeal}`}
					onrecipeSelect={handleRecipeSelect}
					ontoggleFavorite={handleToggleFavorite}
				></recipe-card>
			{/each}
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: system-ui, sans-serif;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 1rem;
		color: #007bff;
		text-decoration: none;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	h1 {
		margin-bottom: 2rem;
		color: #333;
	}

	.no-meals {
		text-align: center;
		color: #666;
		font-size: 1.2rem;
	}

	.grid {
		/* display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem; */
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 16px;
	}
</style>
