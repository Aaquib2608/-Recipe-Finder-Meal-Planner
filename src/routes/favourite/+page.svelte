<script lang="ts">
	import { onMount } from 'svelte';
	import { getFavoriteIds } from '$lib/stores/favoriteStore';
	import { getUserRecipe, isUserRecipe } from '$lib/stores/recipeStore';

	interface FavoriteRecipe {
		id: string;
		strMeal: string;
		strMealThumb: string;
	}

	let favorites = $state<FavoriteRecipe[]>([]);
	let isLoading = $state(true);

	onMount(() => {
		loadFavorites();
	});

	async function loadFavorites() {
		isLoading = true;
		const favoriteIds = getFavoriteIds();
		const loadedFavorites: FavoriteRecipe[] = [];

		for (const id of favoriteIds) {
			if (isUserRecipe(id)) {
				// Load from localStorage
				const userRecipe = getUserRecipe(id);
				if (userRecipe) {
					loadedFavorites.push({
						id: userRecipe.id,
						strMeal: userRecipe.strMeal,
						strMealThumb: userRecipe.strMealThumb || ''
					});
				}
			} else {
				// Fetch from API
				try {
					const response = await fetch(
						`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
					);
					const data = await response.json();
					const meal = data.meals?.[0];
					if (meal) {
						loadedFavorites.push({
							id: meal.idMeal,
							strMeal: meal.strMeal,
							strMealThumb: meal.strMealThumb
						});
					}
				} catch (error) {
					console.error(`Failed to fetch meal ${id}:`, error);
				}
			}
		}

		favorites = loadedFavorites;
		isLoading = false;
	}

	// Handle when favorite is toggled via recipe-card component
	function handleToggleFavorite(event: CustomEvent<{ id: string; favorite: boolean }>) {
		if (!event.detail.favorite) {
			// Recipe was unfavorited, remove from list
			favorites = favorites.filter((f) => f.id !== event.detail.id);
		}
	}
</script>

<svelte:head>
	<title>Favorites | Recipe Finder</title>
</svelte:head>

<main>
	<header class="page-header">
		<h1>My Favorites</h1>
	</header>

	{#if isLoading}
		<div class="loading">Loading your favorites...</div>
	{:else if favorites.length === 0}
		<div class="empty-state">
			<h2>No favorites yet</h2>
			<p>Start adding recipes to your favorites to see them here!</p>
			<a href="/" class="browse-btn">Browse Recipes</a>
		</div>
	{:else}
		<div class="favorites-grid">
			{#each favorites as recipe (recipe.id)}
				<recipe-card
					recipe-id={recipe.id}
					recipe-title={recipe.strMeal}
					image={recipe.strMealThumb}
					url={`/meal/${recipe.id}`}
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
		font-family: system-ui, -apple-system, sans-serif;
        padding: 2rem;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		margin: 0;
		font-size: 2rem;
		color: #1a1a2e;
	}

	.loading {
		text-align: center;
		padding: 4rem 2rem;
		color: #666;
		font-size: 1.125rem;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: #f8f9fa;
		border-radius: 16px;
	}

	.empty-state h2 {
		margin: 0 0 0.5rem;
		color: #333;
	}

	.empty-state p {
		color: #666;
		margin-bottom: 1.5rem;
	}

	.browse-btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		transition: opacity 0.2s;
	}

	.browse-btn:hover {
		opacity: 0.9;
	}

	.favorites-grid {
		display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 16px;
	}

	@media (max-width: 640px) {
		.favorites-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>