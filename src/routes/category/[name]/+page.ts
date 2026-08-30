import type { PageLoad } from './$types';

interface Meal {
	idMeal: string;
	strMeal: string;
	strMealThumb: string;
}

interface FilterResponse {
	meals: Meal[] | null;
}

export const load: PageLoad = async ({ fetch, params }) => {
	const response = await fetch(
		`https://www.themealdb.com/api/json/v1/1/filter.php?c=${params.name}`
	);
	const data: FilterResponse = await response.json();

	return {
		categoryName: params.name,
		meals: data.meals || []
	};
};
