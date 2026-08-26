<script lang="ts">
	import type { Album, MediaCategory } from '$lib/types/media';
	import { dragScroll } from '$lib/utils/drag-scroll';
	import { DotsSixVertical } from 'phosphor-svelte';
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
</script>

{#if preview.length > 0}
	<section class="mb-8" aria-label="Collections">
		<div class="mb-3 flex items-end justify-between gap-3">
			<h2 class="text-sm font-black tracking-wide text-stone-700 uppercase dark:text-stone-300">
				Collections
			</h2>
			<a
				href="/albums/{category}"
				class="pill-nav bg-amber-400/15 text-amber-700 hover:bg-amber-400/25 dark:text-amber-400"
			>
				See all
			</a>
		</div>
		<div class="relative">
			<div
				bind:this={scrollEl}
				class="flex snap-x [scrollbar-width:none] gap-4 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
			>
				{#each preview as album, index (album.id)}
					<div class="anim-rise shrink-0 snap-start" style="--rise-delay: {index * 50}ms">
						<AlbumCard {album} displayCoverUrl={coverUrls[album.id] ?? null} />
					</div>
				{/each}
				{#if showAddTile && onAddCollection}
					<div class="anim-rise shrink-0 snap-start" style="--rise-delay: {preview.length * 50}ms">
						<AddCollectionTile {category} onclick={onAddCollection} />
					</div>
				{/if}
			</div>
			<!-- Edge fade hints that the shelf keeps scrolling -->
			<div
				class="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[rgb(var(--color-bg))] to-transparent"
				aria-hidden="true"
			></div>
			<div
				use:dragScroll={{ scrollTarget: scrollEl }}
				aria-label="Drag to scroll collections"
				class="mt-3 flex h-8 w-full touch-none items-center justify-center gap-0.5 rounded-full border border-amber-400/20 bg-stone-100/90 select-none dark:border-amber-400/15 dark:bg-stone-800/80"
			>
				<DotsSixVertical
					size={16}
					weight="bold"
					class="text-amber-600/50 dark:text-amber-400/40"
					aria-hidden="true"
				/>
				<DotsSixVertical
					size={16}
					weight="bold"
					class="text-amber-600/50 dark:text-amber-400/40"
					aria-hidden="true"
				/>
			</div>
		</div>
	</section>
{/if}
