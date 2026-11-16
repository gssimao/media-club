<script lang="ts">
	import { settings } from '$lib/stores/settings.svelte';
	import type { Album, MediaCategory } from '$lib/types/media';
	import { dragScroll } from '$lib/utils/drag-scroll';
	import { CaretLeft, CaretRight, Folders, Television } from 'phosphor-svelte';
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
		scrollEl.scrollBy({
			left: direction * scrollEl.clientWidth * 0.8,
			behavior: settings.reducedMotion ? 'instant' : 'smooth'
		});
	}
</script>

{#if preview.length > 0 || showAddTile || category === 'movie'}
	<section class="mb-8" aria-label="Collections">
		<div class="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
			<div class="contents">
				<h2
					class="text-sm font-semibold tracking-normal text-stone-700 normal-case dark:text-stone-300"
				>
					Collections
				</h2>
				<a href="/albums/{category}" class="pill-nav control-pill--secondary text-xs"
					><Folders size={16} />View collections</a
				>
				{#if category === 'movie'}
					<a href="/movies/streaming" class="pill-nav control-pill--secondary text-xs"
						><Television size={16} />View streaming list</a
					>
				{/if}
			</div>
			{#if overflowing}
				<div class="ml-auto flex shrink-0 gap-1">
					<button
						class="shelf-arrow"
						type="button"
						aria-label="Previous collections"
						disabled={!canScrollBack}
						onclick={() => scrollByPage(-1)}><CaretLeft size={18} /></button
					>
					<button
						class="shelf-arrow"
						type="button"
						aria-label="Next collections"
						disabled={!canScrollForward}
						onclick={() => scrollByPage(1)}><CaretRight size={18} /></button
					>
				</div>
			{/if}
		</div>
		<div
			bind:this={scrollEl}
			use:dragScroll
			onscroll={updateScrollState}
			class="shelf-scroll"
			class:shelf-scroll--fade-start={canScrollBack}
			class:shelf-scroll--fade-end={canScrollForward}
		>
			{#if showAddTile}
				<div class="shelf-tile">
					<AddCollectionTile {category} onclick={() => onAddCollection?.()} />
				</div>
			{/if}
			{#each preview as album, index (album.id)}
				<div class="anim-rise shelf-tile" style="--rise-delay: {index * 50}ms">
					<AlbumCard {album} displayCoverUrl={coverUrls[album.id] ?? null} />
				</div>
			{/each}
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
		width: 2.75rem;
		height: 2.75rem;
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
