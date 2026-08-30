import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Optimize Stencil component library
	optimizeDeps: {
		exclude: ['@mdaaquibkhan/recipe-ui-components']
	}
});
