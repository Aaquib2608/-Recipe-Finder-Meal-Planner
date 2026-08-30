<script lang="ts">
	import { onMount } from 'svelte';

	interface PlannerCardData {
		day: string;
		recipeIds: string;
		title: string;
		image: string;
		url: string;
	}

	const STORAGE_KEY = 'weekPlanner';
	const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

	let plannerCards = $state<PlannerCardData[]>([]);
	let isLoading = $state(true);

	const fallbackPlannerCards: PlannerCardData[] = DAYS_ORDER.map((day) => ({
		day: day.charAt(0).toUpperCase() + day.slice(1),
		recipeIds: '',
		title: '',
		image: '',
		url: ''
	}));

	onMount(() => {
		void reloadPlannerCards();
	});

	async function reloadPlannerCards() {
		isLoading = true;
		plannerCards = await loadPlannerCards();
		isLoading = false;
	}

	async function loadPlannerCards(): Promise<PlannerCardData[]> {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [...fallbackPlannerCards];

		try {
			const parsed = JSON.parse(stored);
			return await normalizeWeekPlanner(parsed);
		} catch (error) {
			console.error('Invalid weekPlanner data in localStorage:', error);
			return [...fallbackPlannerCards];
		}
	}

	async function normalizeWeekPlanner(data: unknown): Promise<PlannerCardData[]> {
		const baseCards = [...fallbackPlannerCards];

		if (!Array.isArray(data)) {
			return baseCards;
		}

		const parsedEntries = data
			.map((entry) => parseWeekPlannerToken(entry))
			.filter((entry): entry is { dayIndex: number; recipeId: string } => entry !== null);

		const recipes = await Promise.all(
			parsedEntries.map(async ({ recipeId }) => {
				const details = await fetchRecipeDetails(recipeId);
				return { recipeId, details };
			})
		);

		for (let i = 0; i < parsedEntries.length; i += 1) {
			const { dayIndex, recipeId } = parsedEntries[i];
			const meal = recipes[i].details;
			baseCards[dayIndex] = {
				...baseCards[dayIndex],
				recipeIds: recipeId,
				title: meal?.strMeal || `Recipe ${recipeId}`,
				image: meal?.strMealThumb || '',
				url: `/meal/${recipeId}`
			};
		}

		return baseCards;
	}

	async function fetchRecipeDetails(
		recipeId: string
	): Promise<{ strMeal: string; strMealThumb: string } | null> {
		try {
			const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
			if (!response.ok) return null;

			const data = await response.json();
			const meal = data?.meals?.[0];
			if (!meal) return null;

			return {
				strMeal: String(meal.strMeal || ''),
				strMealThumb: String(meal.strMealThumb || '')
			};
		} catch (error) {
			console.error(`Failed to fetch recipe ${recipeId}:`, error);
			return null;
		}
	}

	function parseWeekPlannerToken(entry: unknown): { dayIndex: number; recipeId: string } | null {
		if (typeof entry !== 'string') return null;

		const [dayToken, recipeId] = entry.split('-');
		if (!dayToken || !recipeId) return null;

		const dayIndexMap: Record<string, number> = {
			mon: 0,
			tue: 1,
			wed: 2,
			thu: 3,
			fri: 4,
			sat: 5,
			sun: 6
		};

		const dayIndex = dayIndexMap[dayToken.toLowerCase()];
		if (dayIndex === undefined) return null;

		return { dayIndex, recipeId };
	}

	function toPlannerCard(value: unknown, fallbackDay = ''): PlannerCardData | null {
		if (!isRecord(value)) {
			if (typeof value === 'string' || typeof value === 'number') {
				if (!fallbackDay) return null;

				const recipeIds = String(value);
				return {
					day: fallbackDay,
					recipeIds,
					title: `Recipe ${recipeIds}`,
					image: '',
					url: `/meal/${recipeIds.split(',')[0]}`
				};
			}
			return null;
		}

		const day = toText(value.day) || toText(value.dayName) || fallbackDay;
		const recipeIds = resolveRecipeIds(value);
		if (!day || !recipeIds) return null;

		const primaryId = recipeIds.split(',')[0];
		return {
			day,
			recipeIds,
			title: toText(value.title) || toText(value.name) || toText(value.strMeal) || `Recipe ${primaryId}`,
			image: toText(value.image) || toText(value.strMealThumb) || '',
			url: toText(value.url) || `/meal/${primaryId}`
		};
	}

	function resolveRecipeIds(value: Record<string, unknown>): string {
		const raw =
			value['recipe-ids'] ?? value.recipeIds ?? value.recipeId ?? value.id ?? value.ids ?? value.mealId;

		if (Array.isArray(raw)) {
			return raw.map((entry) => String(entry)).join(',');
		}

		if (typeof raw === 'string' || typeof raw === 'number') {
			return String(raw);
		}

		return '';
	}

	function toText(value: unknown): string {
		return typeof value === 'string' ? value : '';
	}

	function isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null;
	}

	function sortByDay(a: PlannerCardData, b: PlannerCardData): number {
		const first = DAYS_ORDER.indexOf(a.day.toLowerCase());
		const second = DAYS_ORDER.indexOf(b.day.toLowerCase());

		if (first === -1 && second === -1) return a.day.localeCompare(b.day);
		if (first === -1) return 1;
		if (second === -1) return -1;

		return first - second;
	}

	function getCardsToRender(): PlannerCardData[] {
		return plannerCards.length > 0 ? plannerCards : fallbackPlannerCards;
	}

	function handleOverlayRecipeAdded() {
		void reloadPlannerCards();
	}
</script>

<svelte:head>
	<title>Planner | Recipe Finder</title>
</svelte:head>

<main>
	<header class="page-header">
		<h1>Weekly Planner</h1>
	</header>

	{#if isLoading}
		<div class="loading">Loading planner...</div>
	{:else}
		<div class="planner-grid">
			{#each getCardsToRender() as card, index (`${card.day}-${card.recipeIds}-${index}`)}
				<planner-card
					day={card.day}
					empty={!card.recipeIds}
					recipe-ids={card.recipeIds}
					recipe-title={card.title || (card.recipeIds ? `Recipe ${card.recipeIds}` : '')}
					image={card.image}
					url={card.url}
				></planner-card>
			{/each}
		</div>
	{/if}
	<recipe-overlay onrecipeAdded={handleOverlayRecipeAdded}></recipe-overlay>
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
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

	.planner-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 16px;
	}

	.planner-grid planner-card {
		flex: 0 1 220px;
		max-width: 220px;
	}

	@media (max-width: 640px) {
		.planner-grid {
			justify-content: stretch;
		}

		.planner-grid planner-card {
			flex: 1 1 calc(50% - 8px);
			max-width: none;
		}
	}
</style>
