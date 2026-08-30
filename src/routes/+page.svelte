<script lang="ts">
	import type { PageData } from './$types';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import { base } from '$app/paths';

	let { data }: { data: PageData } = $props();

	// Search and filter state
	let searchQuery = $state('');
	let ingredientFilter = $state('');
	let selectedCategory = $state('');
	let searchResults = $state<Array<{ idMeal: string; strMeal: string; strMealThumb: string }>>([]);
	let isLoading = $state(false);
	let hasSearched = $state(false);

	// Search recipes by name
	async function searchRecipes() {
		if (!searchQuery.trim()) return;
		isLoading = true;
		hasSearched = true;
		try {
			const response = await fetch(
				`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchQuery)}`
			);
			const data = await response.json();
			searchResults = data.meals || [];
		} catch (error) {
			console.error('Search failed:', error);
			searchResults = [];
		}
		isLoading = false;
	}

	// Filter by ingredient
	async function filterByIngredient() {
		if (!ingredientFilter.trim()) return;
		isLoading = true;
		hasSearched = true;
		try {
			const response = await fetch(
				`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredientFilter.replace(/ /g, '_'))}`
			);
			const data = await response.json();
			searchResults = data.meals || [];
		} catch (error) {
			console.error('Filter failed:', error);
			searchResults = [];
		}
		isLoading = false;
	}

	// Filter by category
	async function filterByCategory() {
		if (!selectedCategory) return;
		isLoading = true;
		hasSearched = true;
		try {
			const response = await fetch(
				`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(selectedCategory)}`
			);
			const data = await response.json();
			searchResults = data.meals || [];
		} catch (error) {
			console.error('Filter failed:', error);
			searchResults = [];
		}
		isLoading = false;
	}

	// Clear all filters and results
	function clearSearch() {
		searchQuery = '';
		ingredientFilter = '';
		selectedCategory = '';
		searchResults = [];
		hasSearched = false;
	}
</script>

<svelte:head>
	<title>Recipe Finder & Meal Planner</title>
</svelte:head>

<main>
	<header class="hero">
		<h1>Recipe Finder & Meal Planner</h1>
		<p>Discover delicious recipes from around the world</p>
	</header>

	<!-- Recipe Discovery Section -->
	<section class="discovery">
		<h2>Recipe Discovery</h2>

		<div class="search-filters">
			<!-- Search by Name -->
			<div class="filter-group">
				<label for="search">Search by Name</label>
				<div class="input-group">
					<input
						type="text"
						id="search"
						bind:value={searchQuery}
						placeholder="e.g., Arrabiata, Chicken..."
						onkeydown={(e) => e.key === 'Enter' && searchRecipes()}
					/>
					<button onclick={searchRecipes} disabled={isLoading}>Search</button>
				</div>
			</div>

			<!-- Filter by Ingredient -->
			<div class="filter-group">
				<label for="ingredient">Filter by Ingredient</label>
				<div class="input-group">
					<input
						type="text"
						id="ingredient"
						bind:value={ingredientFilter}
						placeholder="e.g., chicken breast, salmon..."
						onkeydown={(e) => e.key === 'Enter' && filterByIngredient()}
					/>
					<button onclick={filterByIngredient} disabled={isLoading}>Filter</button>
				</div>
			</div>

			<!-- Filter by Category -->
			<div class="filter-group">
				<label for="category">Filter by Category</label>
				<div class="input-group">
					<select id="category" bind:value={selectedCategory} onchange={filterByCategory}>
						<option value="">Select a category...</option>
						{#each data.categories as category}
							<option value={category.strCategory}>{category.strCategory}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		{#if hasSearched}
			<div class="results-header">
				<h3>
					{#if isLoading}
						Searching...
					{:else}
						Found {searchResults.length} recipe{searchResults.length !== 1 ? 's' : ''}
					{/if}
				</h3>
				<button class="clear-btn" onclick={clearSearch}>Clear Results</button>
			</div>

			{#if !isLoading && searchResults.length > 0}
				<div class="results-grid">
					{#each searchResults as meal}
						<recipe-card
							recipe-id={meal.idMeal}
							recipe-title={meal.strMeal}
							image={meal.strMealThumb}
							url={`${base}/meal/${meal.idMeal}`}
						></recipe-card>
					{/each}
				</div>
			{:else if !isLoading && searchResults.length === 0}
				<p class="no-results">No recipes found. Try a different search term or filter.</p>
			{/if}
		{/if}
	</section>

	<section class="categories">
		<h2>Browse by Category</h2>
		<div class="grid">
			{#each data.categories as category}
				<CategoryCard
					id={category.idCategory}
					name={category.strCategory}
					image={category.strCategoryThumb}
					description={category.strCategoryDescription}
					href={`${base}/category/${category.strCategory}`}
				/>
			{/each}
		</div>
	</section>
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.hero {
		text-align: center;
		padding: 3rem 1rem;
		margin-bottom: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 20px;
		color: white;
	}

	.hero h1 {
		margin: 0 0 0.5rem;
		font-size: 2.5rem;
		font-weight: 800;
	}

	.hero p {
		margin: 0;
		font-size: 1.125rem;
		opacity: 0.9;
	}

	/* Discovery Section */
	.discovery {
		margin-bottom: 3rem;
		padding: 2rem;
		background: #f8f9fa;
		border-radius: 16px;
	}

	.discovery h2 {
		margin: 0 0 1.5rem;
		font-size: 1.5rem;
		color: #1a1a2e;
	}

	.search-filters {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 3rem;
		margin-bottom: 1.5rem;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-group label {
		font-weight: 600;
		color: #333;
		font-size: 0.9rem;
	}

	.input-group {
		display: flex;
		gap: 0.5rem;
	}

	.input-group input,
	.input-group select {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.input-group input:focus,
	.input-group select:focus {
		outline: none;
		border-color: #667eea;
	}

	.input-group button {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.input-group button:hover:not(:disabled) {
		opacity: 0.9;
	}

	.input-group button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.results-header h3 {
		margin: 0;
		color: #333;
	}

	.clear-btn {
		padding: 0.5rem 1rem;
		background: #e74c3c;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.clear-btn:hover {
		background: #c0392b;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.no-results {
		text-align: center;
		color: #666;
		font-style: italic;
	}

	/* Categories Section */
	.categories h2 {
		margin: 0 0 1.5rem;
		font-size: 1.5rem;
		color: #1a1a2e;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	@media (max-width: 640px) {
		.hero h1 {
			font-size: 1.75rem;
		}

		.grid {
			grid-template-columns: 1fr;
		}

		.search-filters {
			grid-template-columns: 1fr;
		}

		.results-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
