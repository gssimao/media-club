<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		title,
		description,
		controls,
		children
	}: { title: string; description?: string; controls?: Snippet; children: Snippet } = $props();
</script>

<div class="page-shell">
	<header class="page-shell__heading">
		<div class="page-shell__intro">
			<h1>{title}</h1>
			{#if description}<p>{description}</p>{/if}
		</div>
		{#if controls}<div class="page-shell__controls" role="group" aria-label="Page controls">
				{@render controls()}
			</div>{/if}
	</header>
	<div class="page-shell__content">{@render children()}</div>
</div>

<style>
	.page-shell {
		min-width: 0;
		padding-block: 2.5rem 1rem;
	}
	.page-shell__heading {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.5rem 2rem;
		margin-bottom: 2.5rem;
	}
	.page-shell__intro {
		min-width: 0;
	}
	h1 {
		margin: 0;
		font-size: clamp(1.85rem, 4vw, 2.75rem);
		font-weight: 650;
		letter-spacing: -0.045em;
		line-height: 1.12;
		text-wrap: balance;
	}
	p {
		margin: 0.65rem 0 0;
		max-width: 42rem;
		color: rgb(var(--color-text-secondary));
		font-size: 0.9375rem;
		line-height: 1.6;
	}
	.page-shell__controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
		max-width: 100%;
	}
	.page-shell__content {
		min-width: 0;
	}
	@media (max-width: 767px) {
		.page-shell {
			padding-top: 1.75rem;
		}
		.page-shell__heading {
			gap: 1.25rem;
			margin-bottom: 1.75rem;
		}
		p {
			font-size: 0.875rem;
		}
	}
</style>
