<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { getUserRecipe, type UserRecipe } from '$lib/stores/recipeStore';
	import { isFavorite, toggleFavorite } from '$lib/stores/favoriteStore';

	let { data }: { data: PageData } = $props();

	// State for user recipes loaded from localStorage
	let userRecipe = $state<UserRecipe | null>(null);
	let userRecipeLoaded = $state(false);
	let isFav = $state(false);

	// Loading state derived from whether we need to load user recipe
	const isLoading = $derived(data.isUserRecipe && !userRecipeLoaded);

	// Load user recipe from localStorage on mount
	onMount(() => {
		if (data.isUserRecipe && data.recipeId) {
			userRecipe = getUserRecipe(data.recipeId);
			userRecipeLoaded = true;
		}
		// Check if this recipe is favorited
		isFav = isFavorite(data.recipeId);
	});

	// Computed values for display
	const meal = $derived(data.isUserRecipe ? userRecipe : data.meal);
	const ingredients = $derived(
		data.isUserRecipe ? (userRecipe?.ingredients || []) : data.ingredients
	);

	function getYoutubeEmbedUrl(url: string | null | undefined): string | null {
		if (!url) return null;
		const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
		return match ? `https://www.youtube.com/embed/${match[1]}` : null;
	}

	const youtubeEmbed = $derived(getYoutubeEmbedUrl(meal?.strYoutube));

	function handleToggleFavorite() {
		isFav = toggleFavorite(data.recipeId);
	}
</script>

<svelte:head>
	<title>{meal?.strMeal || 'Meal Not Found'} | Recipe Finder</title>
</svelte:head>

<main>
	<a href="/" class="back-link">← Back to Categories</a>

	{#if isLoading}
		<div class="loading">Loading recipe...</div>
	{:else if !meal}
		<div class="not-found">
			<h1>Meal Not Found</h1>
			<p>Sorry, we couldn't find the meal you're looking for.</p>
		</div>
	{:else}
		<article class="meal-detail">
			{#if data.isUserRecipe}
				<div class="user-recipe-badge">Your Recipe</div>
			{/if}
			<header>
				{#if meal.strMealThumb}
					<img src={meal.strMealThumb} alt={meal.strMeal} class="meal-image" />
				{:else}
					<div class="meal-image placeholder">
						<span>No Image</span>
					</div>
				{/if}
				<div class="meal-header">
					<div class="title-row">
						<h1>{meal.strMeal}</h1>
						<button
							class="favorite-btn"
							class:is-favorite={isFav}
							onclick={handleToggleFavorite}
							title={isFav ? 'Remove from favorites' : 'Add to favorites'}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
							</svg>
						</button>
					</div>
					<div class="meta">
						<span class="category">{meal.strCategory}</span>
						{#if meal.strArea}
							<span class="area">{meal.strArea}</span>
						{/if}
						{#if meal.strTags}
							<div class="tags">
								{#each meal.strTags.split(',') as tag}
									<span class="tag">{tag.trim()}</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</header>

			<section class="ingredients">
				<h2>Ingredients</h2>
				<ul>
					{#each ingredients as ingredient}
						<li>
							<span class="measure">{ingredient.measure}</span>
							<span class="ingredient-name">{ingredient.name}</span>
						</li>
					{/each}
				</ul>
			</section>

			<section class="instructions">
				<h2>Instructions</h2>
				<p>{meal.strInstructions}</p>
			</section>

			{#if youtubeEmbed}
				<section class="video">
					<h2>Video Tutorial</h2>
					<div class="video-container">
						<iframe
							src={youtubeEmbed}
							title="Recipe video"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					</div>
				</section>
			{/if}

		</article>
	{/if}
</main>

<style>
	main {
		max-width: 900px;
		margin: 0 auto;
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

	.loading {
		text-align: center;
		padding: 4rem 2rem;
		color: #666;
		font-size: 1.125rem;
	}

	.not-found {
		text-align: center;
		padding: 4rem 2rem;
	}

	.not-found h1 {
		color: #333;
	}

	.not-found p {
		color: #666;
	}

	.user-recipe-badge {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.meal-detail header {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	@media (max-width: 768px) {
		.meal-detail header {
			grid-template-columns: 1fr;
		}
	}

	.meal-image {
		width: 100%;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.meal-image.placeholder {
		height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #e0e0e0;
		color: #666;
	}

	.meal-header {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.title-row h1 {
		margin: 0;
		font-size: 2rem;
		color: #333;
	}

	.favorite-btn {
		flex-shrink: 0;
		width: 44px;
		height: 44px;
		border: 2px solid #e0e0e0;
		border-radius: 50%;
		background: white;
		color: #999;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.favorite-btn:hover {
		border-color: #e74c3c;
		color: #e74c3c;
	}

	.favorite-btn.is-favorite {
		border-color: #e74c3c;
		background: #e74c3c;
		color: white;
	}

	.favorite-btn.is-favorite:hover {
		background: #c0392b;
		border-color: #c0392b;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	.category,
	.area {
		padding: 0.25rem 0.75rem;
		background: #f0f0f0;
		border-radius: 20px;
		font-size: 0.875rem;
		color: #555;
	}

	.category {
		background: #e3f2fd;
		color: #1976d2;
	}

	.area {
		background: #fff3e0;
		color: #e65100;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
		width: 100%;
	}

	.tag {
		padding: 0.2rem 0.5rem;
		background: #e8f5e9;
		color: #388e3c;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	section {
		margin-bottom: 2rem;
	}

	h2 {
		color: #333;
		border-bottom: 2px solid #eee;
		padding-bottom: 0.5rem;
		margin-bottom: 1rem;
	}

	.ingredients ul {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.5rem;
	}

	.ingredients li {
		padding: 0.5rem;
		background: #f9f9f9;
		border-radius: 4px;
	}

	.measure {
		font-weight: 600;
		color: #007bff;
		margin-right: 0.5rem;
	}

	.ingredient-name {
		color: #333;
	}

	.instructions p {
		line-height: 1.8;
		color: #444;
		white-space: pre-line;
	}

	.video-container {
		position: relative;
		padding-bottom: 56.25%;
		height: 0;
		overflow: hidden;
		border-radius: 12px;
	}

	.video-container iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
