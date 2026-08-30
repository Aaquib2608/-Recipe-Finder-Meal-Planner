import { browser } from '$app/environment';

// Use the same key as recipe-card component
const STORAGE_KEY = 'wishlist';

// Get all favorite recipe IDs from localStorage (compatible with recipe-card format)
export function getFavoriteIds(): string[] {
	if (!browser) return [];
	try {
		const rawWishlist = localStorage.getItem(STORAGE_KEY);
		if (!rawWishlist) return [];
		
		const parsedWishlist = JSON.parse(rawWishlist);
		if (Array.isArray(parsedWishlist)) {
			return parsedWishlist
				.map((item) => (typeof item === 'string' ? item : item?.id))
				.filter(Boolean);
		}
		return parsedWishlist?.id ? [parsedWishlist.id] : [];
	} catch {
		return [];
	}
}

// Save favorite IDs to localStorage
function saveFavorites(ids: string[]): void {
	if (!browser) return;
	if (ids.length) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
	} else {
		localStorage.removeItem(STORAGE_KEY);
	}
}

// Check if a recipe is favorited
export function isFavorite(id: string): boolean {
	const favorites = getFavoriteIds();
	return favorites.includes(id);
}

// Add a recipe to favorites
export function addFavorite(id: string): void {
	const favorites = getFavoriteIds();
	if (!favorites.includes(id)) {
		favorites.push(id);
		saveFavorites(favorites);
	}
}

// Remove a recipe from favorites
export function removeFavorite(id: string): void {
	const favorites = getFavoriteIds();
	const index = favorites.indexOf(id);
	if (index > -1) {
		favorites.splice(index, 1);
		saveFavorites(favorites);
	}
}

// Toggle favorite status
export function toggleFavorite(id: string): boolean {
	if (isFavorite(id)) {
		removeFavorite(id);
		return false;
	} else {
		addFavorite(id);
		return true;
	}
}
