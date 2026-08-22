<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		controls?: Snippet;
		children: Snippet;
	}

	let { title, description, controls, children }: Props = $props();
</script>

<div class="page-shell">
	<aside class="page-shell__control" aria-label="Page control center">
		<div class="page-shell__now-playing">
			<p class="page-shell__kicker">Now playing <span aria-hidden="true">—</span></p>
			<h1 class="page-shell__title">{title}</h1>
			{#if description}
				<p class="page-shell__description">{description}</p>
			{/if}
		</div>

		{#if controls}
			<div class="page-shell__controls">
				{@render controls()}
			</div>
		{/if}
	</aside>

	<div class="page-shell__content">
		{@render children()}
	</div>
</div>

<style>
	.page-shell {
		display: grid;
		grid-template-columns: var(--nav-dial-reserve-w) minmax(0, 1fr);
		align-items: start;
		gap: 1.25rem 1.75rem;
		min-height: calc(100vh - var(--nav-dial-reserve-h));
	}

	.page-shell__control {
		position: sticky;
		top: calc(var(--nav-dial-reserve-h) + 1.25rem);
		z-index: 20;
		align-self: start;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		/* Margin clears the fixed dial on first paint; sticky top keeps it below the wheel when scrolling */
		margin-top: max(12.5rem, calc(var(--nav-dial-reserve-h) + 1.25rem));
		padding-top: 0;
		padding-left: var(--nav-dial-inset);
		padding-right: 0.25rem;
		max-width: var(--nav-dial-reserve-w);
		max-height: calc(100vh - var(--nav-dial-reserve-h) - 1rem);
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
	}

	.page-shell__now-playing {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.page-shell__kicker {
		margin: 0;
		font-size: 0.7rem;
		font-weight: 800;
		line-height: 1.35;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: rgb(var(--color-text-secondary));
	}

	.page-shell__title {
		display: block;
		margin: 0.15rem 0 0;
		font-style: italic;
		font-size: 1.35rem;
		font-weight: 900;
		line-height: 1.15;
		letter-spacing: 0.02em;
		text-transform: none;
		color: rgb(var(--color-text));
	}

	.page-shell__description {
		margin: 0;
		font-size: 0.8rem;
		font-weight: 500;
		line-height: 1.45;
		color: rgb(var(--color-text-secondary));
	}

	.page-shell__controls {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.65rem;
	}

	.page-shell__content {
		min-width: 0;
		max-width: 100%;
		align-self: start;
		padding-top: 0;
		padding-right: 0.25rem;
	}

	@media (max-width: 767px) {
		.page-shell {
			grid-template-columns: minmax(0, 1fr);
			gap: 1rem;
			min-height: auto;
		}

		.page-shell__control {
			position: static;
			max-width: none;
			margin-top: 0;
			padding-top: 0.35rem;
			padding-left: 1rem;
			padding-right: 1rem;
		}

		.page-shell__title {
			font-size: 1.2rem;
		}

		.page-shell__content {
			padding-top: 0.25rem;
			padding-left: 1rem;
			padding-right: 1rem;
		}
	}
</style>
