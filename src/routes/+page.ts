import type { PageLoad } from './$types';

interface Category {
	idCategory: string;
	strCategory: string;
	strCategoryThumb: string;
	strCategoryDescription: string;
}

interface CategoriesResponse {
	categories: Category[];
}

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
	const data: CategoriesResponse = await response.json();

	return {
		categories: data.categories
	};
};
