import { browser } from '$app/environment';

export interface UserRecipe {
	id: string;
	strMeal: string;
	strCategory: string;
	strArea: string;
	strInstructions: string;
	strMealThumb: string;
	strTags: string;
	strYoutube: string;
	ingredients: { name: string; measure: string }[];
	createdAt: string;
	updatedAt: string;
}

export interface RecipeValidationErrors {
	strMeal?: string;
	strCategory?: string;
	strInstructions?: string;
	ingredients?: string;
}

const STORAGE_KEY = 'user_recipes';

// Get all user recipes from localStorage
export function getUserRecipes(): UserRecipe[] {
	if (!browser) return [];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

// Get a single user recipe by ID
export function getUserRecipe(id: string): UserRecipe | null {
	const recipes = getUserRecipes();
	return recipes.find((r) => r.id === id) || null;
}

// Save all recipes to localStorage
function saveRecipes(recipes: UserRecipe[]): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

// Generate a unique ID for new recipes
function generateId(): string {
	return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Validate recipe input
export function validateRecipe(recipe: Partial<UserRecipe>): RecipeValidationErrors {
	const errors: RecipeValidationErrors = {};

	if (!recipe.strMeal?.trim()) {
		errors.strMeal = 'Recipe name is required';
	} else if (recipe.strMeal.length < 3) {
		errors.strMeal = 'Recipe name must be at least 3 characters';
	} else if (recipe.strMeal.length > 100) {
		errors.strMeal = 'Recipe name must be less than 100 characters';
	}

	if (!recipe.strCategory?.trim()) {
		errors.strCategory = 'Category is required';
	}

	if (!recipe.strInstructions?.trim()) {
		errors.strInstructions = 'Instructions are required';
	} else if (recipe.strInstructions.length < 20) {
		errors.strInstructions = 'Instructions must be at least 20 characters';
	}

	if (!recipe.ingredients || recipe.ingredients.length === 0) {
		errors.ingredients = 'At least one ingredient is required';
	} else {
		const hasValidIngredient = recipe.ingredients.some(
			(ing) => ing.name?.trim() && ing.measure?.trim()
		);
		if (!hasValidIngredient) {
			errors.ingredients = 'At least one ingredient with name and measure is required';
		}
	}

	return errors;
}

// Check if validation passed
export function isValidRecipe(errors: RecipeValidationErrors): boolean {
	return Object.keys(errors).length === 0;
}

// Add a new recipe
export function addRecipe(recipe: Omit<UserRecipe, 'id' | 'createdAt' | 'updatedAt'>): UserRecipe {
	const recipes = getUserRecipes();
	const now = new Date().toISOString();

	const newRecipe: UserRecipe = {
		...recipe,
		id: generateId(),
		createdAt: now,
		updatedAt: now
	};

	recipes.push(newRecipe);
	saveRecipes(recipes);

	return newRecipe;
}

// Update an existing recipe
export function updateRecipe(
	id: string,
	updates: Partial<Omit<UserRecipe, 'id' | 'createdAt'>>
): UserRecipe | null {
	const recipes = getUserRecipes();
	const index = recipes.findIndex((r) => r.id === id);

	if (index === -1) return null;

	const updatedRecipe: UserRecipe = {
		...recipes[index],
		...updates,
		updatedAt: new Date().toISOString()
	};

	recipes[index] = updatedRecipe;
	saveRecipes(recipes);

	return updatedRecipe;
}

// Delete a recipe
export function deleteRecipe(id: string): boolean {
	const recipes = getUserRecipes();
	const index = recipes.findIndex((r) => r.id === id);

	if (index === -1) return false;

	recipes.splice(index, 1);
	saveRecipes(recipes);

	return true;
}

// Check if a recipe is user-created (by ID prefix)
export function isUserRecipe(id: string): boolean {
	return id.startsWith('user_');
}
