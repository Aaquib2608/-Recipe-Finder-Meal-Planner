import type { PageLoad } from './$types';

// Check if this is a user-created recipe (stored in localStorage)
function isUserRecipeId(id: string): boolean {
	return id.startsWith('user_');
}

interface Meal {
	idMeal: string;
	strMeal: string;
	strDrinkAlternate: string | null;
	strCategory: string;
	strArea: string;
	strInstructions: string;
	strMealThumb: string;
	strTags: string | null;
	strYoutube: string | null;
	strIngredient1: string | null;
	strIngredient2: string | null;
	strIngredient3: string | null;
	strIngredient4: string | null;
	strIngredient5: string | null;
	strIngredient6: string | null;
	strIngredient7: string | null;
	strIngredient8: string | null;
	strIngredient9: string | null;
	strIngredient10: string | null;
	strIngredient11: string | null;
	strIngredient12: string | null;
	strIngredient13: string | null;
	strIngredient14: string | null;
	strIngredient15: string | null;
	strIngredient16: string | null;
	strIngredient17: string | null;
	strIngredient18: string | null;
	strIngredient19: string | null;
	strIngredient20: string | null;
	strMeasure1: string | null;
	strMeasure2: string | null;
	strMeasure3: string | null;
	strMeasure4: string | null;
	strMeasure5: string | null;
	strMeasure6: string | null;
	strMeasure7: string | null;
	strMeasure8: string | null;
	strMeasure9: string | null;
	strMeasure10: string | null;
	strMeasure11: string | null;
	strMeasure12: string | null;
	strMeasure13: string | null;
	strMeasure14: string | null;
	strMeasure15: string | null;
	strMeasure16: string | null;
	strMeasure17: string | null;
	strMeasure18: string | null;
	strMeasure19: string | null;
	strMeasure20: string | null;
	strSource: string | null;
	strImageSource: string | null;
	strCreativeCommonsConfirmed: string | null;
	dateModified: string | null;
}

interface LookupResponse {
	meals: Meal[] | null;
}

export interface Ingredient {
	name: string;
	measure: string;
}

export const load: PageLoad = async ({ fetch, params }) => {
	// Check if this is a user-created recipe
	if (isUserRecipeId(params.id)) {
		// Return flag to load from localStorage on client side
		return {
			isUserRecipe: true,
			recipeId: params.id,
			meal: null,
			ingredients: []
		};
	}

	const response = await fetch(
		`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${params.id}`
	);
	const data: LookupResponse = await response.json();

	const meal = data.meals?.[0] || null;

	// Extract ingredients and measures into a clean array
	const ingredients: Ingredient[] = [];
	if (meal) {
		for (let i = 1; i <= 20; i++) {
			const ingredient = meal[`strIngredient${i}` as keyof Meal] as string | null;
			const measure = meal[`strMeasure${i}` as keyof Meal] as string | null;
			if (ingredient && ingredient.trim()) {
				ingredients.push({
					name: ingredient.trim(),
					measure: measure?.trim() || ''
				});
			}
		}
	}

	return {
		isUserRecipe: false,
		recipeId: params.id,
		meal,
		ingredients
	};
};
