<script lang="ts">
	interface Props {
		id: string;
		name: string;
		image: string;
		description?: string;
		href: string;
	}

	let { id, name, image, description = '', href }: Props = $props();

	// Truncate description to first 100 characters
	const shortDescription = description.length > 100 
		? description.substring(0, 100) + '...' 
		: description;
</script>

<a {href} class="category-card">
	<div class="image-container">
		<img src={image} alt={name} />
		<div class="overlay">
			<span class="explore">Explore Recipes →</span>
		</div>
	</div>
	<div class="content">
		<h3>{name}</h3>
		{#if shortDescription}
			<p>{shortDescription}</p>
		{/if}
	</div>
</a>

<style>
	.category-card {
		display: block;
		background: white;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		text-decoration: none;
		color: inherit;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	/* .category-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
	} */

	.image-container {
		position: relative;
		height: 180px;
		overflow: hidden;
	}

	.image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	/* .category-card:hover .image-container img {
		transform: scale(1.1);
	} */

	.overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.7) 0%,
			rgba(0, 0, 0, 0) 60%
		);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 1rem;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.category-card:hover .overlay {
		opacity: 1;
	}

	.explore {
		color: white;
		font-weight: 600;
		font-size: 0.875rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(4px);
		border-radius: 20px;
	}

	.content {
		padding: 1.25rem;
	}

	h3 {
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
		font-weight: 700;
		color: #1a1a2e;
	}

	p {
		margin: 0;
		font-size: 0.875rem;
		color: #666;
		line-height: 1.5;
	}
</style>
