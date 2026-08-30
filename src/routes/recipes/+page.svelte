<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import {
		getUserRecipes,
		getUserRecipe,
		addRecipe,
		updateRecipe,
		deleteRecipe,
		validateRecipe,
		isValidRecipe,
		type UserRecipe,
		type RecipeValidationErrors
	} from '$lib/stores/recipeStore';

	// State
	let recipes = $state<UserRecipe[]>([]);
	let isFormOpen = $state(false);
	let editingId = $state<string | null>(null);
	let errors = $state<RecipeValidationErrors>({});
	let successMessage = $state('');

	// Form state
	let formData = $state({
		strMeal: '',
		strCategory: '',
		strArea: '',
		strInstructions: '',
		strMealThumb: '',
		strTags: '',
		strYoutube: '',
		ingredients: [{ name: '', measure: '' }] as { name: string; measure: string }[]
	});

	const categories = [
		'Beef',
		'Breakfast',
		'Chicken',
		'Dessert',
		'Goat',
		'Lamb',
		'Miscellaneous',
		'Pasta',
		'Pork',
		'Seafood',
		'Side',
		'Starter',
		'Vegan',
		'Vegetarian'
	];

	onMount(() => {
		loadRecipes();
	});

	function loadRecipes() {
		recipes = getUserRecipes();
	}

	function resetForm() {
		formData = {
			strMeal: '',
			strCategory: '',
			strArea: '',
			strInstructions: '',
			strMealThumb: '',
			strTags: '',
			strYoutube: '',
			ingredients: [{ name: '', measure: '' }]
		};
		errors = {};
		editingId = null;
	}

	function openAddForm() {
		resetForm();
		isFormOpen = true;
	}

	function openEditForm(id: string) {
		const recipe = getUserRecipe(id);
		if (!recipe) return;

		formData = {
			strMeal: recipe.strMeal,
			strCategory: recipe.strCategory,
			strArea: recipe.strArea || '',
			strInstructions: recipe.strInstructions,
			strMealThumb: recipe.strMealThumb || '',
			strTags: recipe.strTags || '',
			strYoutube: recipe.strYoutube || '',
			ingredients: recipe.ingredients.length > 0 ? [...recipe.ingredients] : [{ name: '', measure: '' }]
		};
		editingId = id;
		errors = {};
		isFormOpen = true;
	}

	function closeForm() {
		isFormOpen = false;
		resetForm();
	}

	function addIngredient() {
		formData.ingredients = [...formData.ingredients, { name: '', measure: '' }];
	}

	function removeIngredient(index: number) {
		if (formData.ingredients.length > 1) {
			formData.ingredients = formData.ingredients.filter((_, i) => i !== index);
		}
	}

	function handleSubmit() {
		// Filter out empty ingredients
		const filteredIngredients = formData.ingredients.filter(
			(ing) => ing.name.trim() || ing.measure.trim()
		);

		const recipeData = {
			...formData,
			ingredients: filteredIngredients
		};

		// Validate
		errors = validateRecipe(recipeData);

		if (!isValidRecipe(errors)) {
			return;
		}

		if (editingId) {
			// Update existing recipe
			updateRecipe(editingId, recipeData);
			successMessage = 'Recipe updated successfully!';
		} else {
			// Add new recipe
			addRecipe(recipeData);
			successMessage = 'Recipe added successfully!';
		}

		loadRecipes();
		closeForm();

		// Clear success message after 3 seconds
		setTimeout(() => {
			successMessage = '';
		}, 3000);
	}

	function handleDelete(id: string) {
		if (confirm('Are you sure you want to delete this recipe?')) {
			deleteRecipe(id);
			loadRecipes();
			successMessage = 'Recipe deleted successfully!';
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		}
	}
</script>

<svelte:head>
	<title>My Recipes | Recipe Finder</title>
</svelte:head>

<main>
	<header class="page-header">
		<h1>My Recipes</h1>
		<button class="add-btn" onclick={openAddForm}>+ Add New Recipe</button>
	</header>

	{#if successMessage}
		<div class="success-message">{successMessage}</div>
	{/if}

	{#if recipes.length === 0}
		<div class="empty-state">
			<h2>No recipes yet</h2>
			<p>Start building your recipe collection by adding your first recipe!</p>
			<button class="add-btn" onclick={openAddForm}>+ Add Your First Recipe</button>
		</div>
	{:else}
		<div class="recipes-grid">
			{#each recipes as recipe}
				<div class="recipe-card-wrapper">
					<recipe-card
						recipe-id={recipe.id}
						recipe-title={recipe.strMeal}
						image={recipe.strMealThumb || ''}
						url={`${base}/meal/${recipe.id}`}
					></recipe-card>
					<div class="action-icons">
						<button class="icon-btn edit-icon" onclick={() => openEditForm(recipe.id)} title="Edit recipe">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
							</svg>
						</button>
						<button class="icon-btn delete-icon" onclick={() => handleDelete(recipe.id)} title="Delete recipe">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="3 6 5 6 21 6"></polyline>
								<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
								<line x1="10" y1="11" x2="10" y2="17"></line>
								<line x1="14" y1="11" x2="14" y2="17"></line>
							</svg>
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if isFormOpen}
		<div class="modal-overlay" onclick={closeForm} role="presentation">
			<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
				<div class="modal-header">
					<h2>{editingId ? 'Edit Recipe' : 'Add New Recipe'}</h2>
					<button class="close-btn" onclick={closeForm}>&times;</button>
				</div>

				<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
					<div class="form-group">
						<label for="name">Recipe Name *</label>
						<input
							type="text"
							id="name"
							bind:value={formData.strMeal}
							placeholder="Enter recipe name"
							class:error={errors.strMeal}
						/>
						{#if errors.strMeal}
							<span class="error-text">{errors.strMeal}</span>
						{/if}
					</div>

					<div class="form-row">
						<div class="form-group">
							<label for="category">Category *</label>
							<select id="category" bind:value={formData.strCategory} class:error={errors.strCategory}>
								<option value="">Select category...</option>
								{#each categories as cat}
									<option value={cat}>{cat}</option>
								{/each}
							</select>
							{#if errors.strCategory}
								<span class="error-text">{errors.strCategory}</span>
							{/if}
						</div>

						<div class="form-group">
							<label for="area">Cuisine/Area</label>
							<input
								type="text"
								id="area"
								bind:value={formData.strArea}
								placeholder="e.g., Italian, Mexican"
							/>
						</div>
					</div>

					<div class="form-group">
						<label for="instructions">Instructions *</label>
						<textarea
							id="instructions"
							bind:value={formData.strInstructions}
							placeholder="Enter cooking instructions..."
							rows="5"
							class:error={errors.strInstructions}
						></textarea>
						{#if errors.strInstructions}
							<span class="error-text">{errors.strInstructions}</span>
						{/if}
					</div>

					<div class="form-group">
						<label for="image">Image URL</label>
						<input
							type="url"
							id="image"
							bind:value={formData.strMealThumb}
							placeholder="https://example.com/image.jpg"
						/>
					</div>

					<div class="form-row">
						<div class="form-group">
							<label for="tags">Tags</label>
							<input
								type="text"
								id="tags"
								bind:value={formData.strTags}
								placeholder="e.g., Spicy, Quick, Healthy"
							/>
						</div>

						<div class="form-group">
							<label for="youtube">YouTube URL</label>
							<input
								type="url"
								id="youtube"
								bind:value={formData.strYoutube}
								placeholder="https://youtube.com/watch?v=..."
							/>
						</div>
					</div>

					<div class="form-group">
						<label>Ingredients *</label>
						{#if errors.ingredients}
							<span class="error-text">{errors.ingredients}</span>
						{/if}
						<div class="ingredients-list">
							{#each formData.ingredients as ingredient, index}
								<div class="ingredient-row">
									<input
										type="text"
										bind:value={ingredient.name}
										placeholder="Ingredient name"
									/>
									<input
										type="text"
										bind:value={ingredient.measure}
										placeholder="Amount"
									/>
									<button
										type="button"
										class="remove-ingredient"
										onclick={() => removeIngredient(index)}
										disabled={formData.ingredients.length === 1}
									>
										&times;
									</button>
								</div>
							{/each}
						</div>
						<button type="button" class="add-ingredient-btn" onclick={addIngredient}>
							+ Add Ingredient
						</button>
					</div>

					<div class="form-actions">
						<button type="button" class="cancel-btn" onclick={closeForm}>Cancel</button>
						<button type="submit" class="submit-btn">
							{editingId ? 'Update Recipe' : 'Add Recipe'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		margin: 0;
		font-size: 2rem;
		color: #1a1a2e;
	}

	.add-btn {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.add-btn:hover {
		opacity: 0.9;
	}

	.success-message {
		padding: 1rem;
		background: #d4edda;
		color: #155724;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		text-align: center;
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

	.recipes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.recipe-card-wrapper {
		position: relative;
	}

	.recipe-card-wrapper:hover .action-icons {
		opacity: 1;
	}

	.action-icons {
		position: absolute;
		top: 8px;
		left: 8px;
		display: flex;
		gap: 0.5rem;
		opacity: 0;
		transition: opacity 0.2s ease;
		z-index: 10;
	}

	.icon-btn {
		width: 36px;
		height: 36px;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s, background 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.edit-icon {
		background: white;
		color: #667eea;
	}

	.edit-icon:hover {
		background: #667eea;
		color: white;
		transform: scale(1.1);
	}

	.delete-icon {
		background: white;
		color: #e74c3c;
	}

	.delete-icon:hover {
		background: #e74c3c;
		color: white;
		transform: scale(1.1);
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: white;
		border-radius: 16px;
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e0e0e0;
		position: sticky;
		top: 0;
		background: white;
		z-index: 1;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #666;
		padding: 0.25rem 0.5rem;
	}

	form {
		padding: 1.5rem;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #333;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #667eea;
	}

	.form-group input.error,
	.form-group select.error,
	.form-group textarea.error {
		border-color: #e74c3c;
	}

	.error-text {
		color: #e74c3c;
		font-size: 0.875rem;
		margin-top: 0.25rem;
		display: block;
	}

	.ingredients-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.ingredient-row {
		display: flex;
		gap: 0.5rem;
	}

	.ingredient-row input:first-child {
		flex: 2;
	}

	.ingredient-row input:nth-child(2) {
		flex: 1;
	}

	.remove-ingredient {
		padding: 0.5rem 0.75rem;
		background: #f0f0f0;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
	}

	.remove-ingredient:hover:not(:disabled) {
		background: #e74c3c;
		color: white;
	}

	.remove-ingredient:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.add-ingredient-btn {
		padding: 0.5rem 1rem;
		background: #f0f0f0;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.add-ingredient-btn:hover {
		background: #e0e0e0;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e0e0e0;
	}

	.cancel-btn {
		padding: 0.75rem 1.5rem;
		background: #f0f0f0;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.submit-btn {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
	}

	.cancel-btn:hover {
		background: #e0e0e0;
	}

	.submit-btn:hover {
		opacity: 0.9;
	}

	@media (max-width: 640px) {
		.page-header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.recipes-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
