<script lang="ts">
	import type { Album, MediaCategory } from '$lib/types/media';
	import { dragScroll } from '$lib/utils/drag-scroll';
	import { CaretLeft, CaretRight } from 'phosphor-svelte';
	import AlbumCard from './AlbumCard.svelte';
	import AddCollectionTile from './AddCollectionTile.svelte';

	interface Props {
		albums: Album[];
		category: MediaCategory;
		coverUrls?: Record<string, string | null>;
		showAddTile?: boolean;
		onAddCollection?: () => void;
	}

	let { albums, category, coverUrls = {}, showAddTile = false, onAddCollection }: Props = $props();

	const preview = $derived(albums.slice(0, 6));

	let scrollEl: HTMLDivElement | undefined = $state();
	let canScrollBack = $state(false);
	let canScrollForward = $state(false);

	const overflowing = $derived(canScrollBack || canScrollForward);

	function updateScrollState() {
		if (!scrollEl) return;
		const { scrollLeft, scrollWidth, clientWidth } = scrollEl;
		canScrollBack = scrollLeft > 1;
		canScrollForward = scrollLeft + clientWidth < scrollWidth - 1;
	}

	// Re-measure when the shelf resizes or tiles are added/removed.
	$effect(() => {
		if (!scrollEl) return;
		const node = scrollEl;
		const observer = new ResizeObserver(updateScrollState);
		observer.observe(node);
		for (const child of node.children) observer.observe(child);
		void preview.length;
		void showAddTile;
		updateScrollState();
		return () => observer.disconnect();
	});

	function scrollByPage(direction: 1 | -1) {
		if (!scrollEl) return;
		scrollEl.scrollBy({ left: direction * scrollEl.clientWidth * 0.8, behavior: 'smooth' });
	}
</script>

{#if preview.length > 0}
	<section class="mb-8" aria-label="Collections">
		<div class="mb-2 flex items-center justify-between gap-3">
			<h2 class="text-sm font-black tracking-wide text-stone-700 uppercase dark:text-stone-300">
				Collections
			</h2>
			<div class="flex items-center gap-1.5">
				{#if overflowing}
					<!-- Mouse users get arrows; touch and trackpads scroll the shelf directly. -->
					<button
						type="button"
						class="shelf-arrow"
						aria-label="Scroll collections back"
						disabled={!canScrollBack}
						onclick={() => scrollByPage(-1)}
					>
						<CaretLeft size={14} weight="bold" />
					</button>
					<button
						type="button"
						class="shelf-arrow"
						aria-label="Scroll collections forward"
						disabled={!canScrollForward}
						onclick={() => scrollByPage(1)}
					>
						<CaretRight size={14} weight="bold" />
					</button>
				{/if}
				<a
					href="/albums/{category}"
					class="pill-nav bg-amber-400/15 text-amber-700 hover:bg-amber-400/25 dark:text-amber-400"
				>
					See all
				</a>
			</div>
		</div>
		<div
			bind:this={scrollEl}
			use:dragScroll
			onscroll={updateScrollState}
			class="shelf-scroll"
			class:shelf-scroll--fade-start={canScrollBack}
			class:shelf-scroll--fade-end={canScrollForward}
		>
			{#each preview as album, index (album.id)}
				<div class="anim-rise shelf-tile" style="--rise-delay: {index * 50}ms">
					<AlbumCard {album} displayCoverUrl={coverUrls[album.id] ?? null} />
				</div>
			{/each}
			{#if showAddTile && onAddCollection}
				<div class="anim-rise shelf-tile" style="--rise-delay: {preview.length * 50}ms">
					<AddCollectionTile {category} onclick={onAddCollection} />
				</div>
			{/if}
		</div>
	</section>
{/if}

<style>
	.shelf-scroll {
		--fade-start: 0px;
		--fade-end: 0px;
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x proximity;
		scrollbar-width: none;
		-ms-overflow-style: none;
		/* Room for the hover lift and drop shadow, which the scroller would otherwise clip. */
		padding: 0.5rem 0 0.75rem;
		/* Fade tiles out at an edge only when there is more to scroll that way. A mask works on
		   any background, unlike a solid-color overlay on top of the page gradient. */
		-webkit-mask-image: linear-gradient(
			to right,
			transparent 0,
			#000 var(--fade-start),
			#000 calc(100% - var(--fade-end)),
			transparent 100%
		);
		mask-image: linear-gradient(
			to right,
			transparent 0,
			#000 var(--fade-start),
			#000 calc(100% - var(--fade-end)),
			transparent 100%
		);
	}

	.shelf-scroll::-webkit-scrollbar {
		display: none;
	}

	.shelf-scroll--fade-start {
		--fade-start: 2.5rem;
	}

	.shelf-scroll--fade-end {
		--fade-end: 2.5rem;
	}

	.shelf-tile {
		flex-shrink: 0;
		scroll-snap-align: start;
	}

	.shelf-arrow {
		display: none;
		width: 2.375rem;
		height: 2.375rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-surface-raised));
		color: rgb(var(--color-text-secondary));
		cursor: pointer;
	}

	.shelf-arrow:hover:not(:disabled) {
		border-color: rgb(var(--color-accent));
		color: rgb(var(--color-text));
	}

	.shelf-arrow:disabled {
		opacity: 0.35;
		cursor: default;
	}

	@media (hover: hover) and (pointer: fine) {
		.shelf-arrow {
			display: inline-flex;
		}
	}
</style>
