// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

// Type declarations for Stencil custom elements
declare namespace svelteHTML {
	interface IntrinsicElements {
		'overlay-card': {
			'card-title': string;
			image: string;
			'recipe-id': string;
		};
		'planner-card': {
			day: string;
			empty?: boolean;
			image?: string;
			onaddRequested?: (event: CustomEvent<{ day: string }>) => void;
			onmealRemoved?: (event: CustomEvent<{ day: string }>) => void;
			title?: string;
			'recipe-ids'?: string;
			url?: string;
		};
		'recipe-card': {
			image: string;
			'recipe-id': string;
			'recipe-title': string;
			url?: string;
		};
		'recipe-overlay': {
			image: string;
			onrecipeAdded?: (event: CustomEvent<{ recipeId: string }>) => void;
			'open-modal'?: boolean;
			'recipe-id': string;
			'selected-day'?: string;
		};
	}
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
