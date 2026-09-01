<script lang="ts">
	import Fuse from 'fuse.js';
	import type { Album, MediaItem, MediaCategory } from '$lib/types/media';
	import { settings } from '$lib/stores/settings.svelte';
	import EmptyState from './EmptyState.svelte';
	import MediaCard from './MediaCard.svelte';
	import MovieCard from './MovieCard.svelte';
	import MediaGridSkeleton from './MediaGridSkeleton.svelte';
	import SearchBar from './SearchBar.svelte';
	import { FolderPlus } from 'phosphor-svelte';

	interface Props {
		items: MediaItem[];
		isAdmin: boolean;
		albums?: Album[];
		category?: MediaCategory;
		/** When set, search runs against this pool (e.g. all owned items including collections). */
		searchItems?: MediaItem[];
		/** Full movie pool for genre picker catalog sections. */
		genreCatalogItems?: MediaItem[];
		emptyTitle: string;
		emptyDescription: string;
		highlightedId?: string | null;
		showAlbumWatchedToggle?: boolean;
		sectionTitle?: string;
		showSearch?: boolean;
		showAddFolderButton?: boolean;
		onAddFolder?: () => void;
		/** Show placeholder discs while route data is loading. */
		loading?: boolean;
	}

	let {
		items,
		isAdmin,
		albums = [],
		category,
		searchItems,
		genreCatalogItems = [],
		emptyTitle,
		emptyDescription,
		highlightedId = null,
		showAlbumWatchedToggle = false,
		sectionTitle,
		showSearch = true,
		showAddFolderButton = false,
		onAddFolder,
		loading = false
	}: Props = $props();

	let query = $state('');

	const searchableItems = $derived(searchItems ?? items);
	const isSearching = $derived(query.trim().length > 0);

	const fuse = $derived(
		new Fuse(searchableItems, {
			keys: [
				{ name: 'title', weight: 0.7 },
				{ name: 'subtitle', weight: 0.2 },
				{ name: 'notes', weight: 0.1 }
			],
			threshold: 0.35,
			ignoreLocation: true
		})
	);

	const filteredItems = $derived.by(() => {
		const trimmed = query.trim();
		if (!trimmed) return items;
		return fuse.search(trimmed).map((result) => result.item);
	});

	// Shelf density from Settings — Compact packs more discs per row (they scale down fluidly).
	const gridClass = $derived(
		settings.density === 'compact'
			? 'grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7'
			: 'grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
	);
</script>

<div class="media-grid">
	{#if loading}
		<MediaGridSkeleton {isAdmin} {showSearch} showSectionHeader={true} />
	{:else}
		{#if showSearch}
			<div class="media-grid__search">
				<SearchBar bind:value={query} onInput={(value) => (query = value)} />
			</div>
		{/if}

		<div class="media-grid__body space-y-6">
			<div class="flex items-center justify-between">
				<p class="text-sm font-bold tracking-wide text-stone-600 uppercase dark:text-stone-400">
					{#if sectionTitle}
						{sectionTitle}
						<span class="font-medium text-[rgb(var(--color-text-tertiary))] normal-case">
							· {filteredItems.length === 1 ? '1 item' : `${filteredItems.length} items`}
						</span>
					{:else}
						{filteredItems.length === 1 ? '1 item' : `${filteredItems.length} items`}
					{/if}
				</p>
				{#if showAddFolderButton && onAddFolder}
					<span class="add-album-wrap group/tip relative">
						<button
							onclick={onAddFolder}
							aria-describedby="add-album-tip"
							class="flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-2 text-xs font-bold tracking-wide text-amber-700 uppercase transition-all hover:bg-amber-400/20 dark:text-amber-400"
						>
							<FolderPlus size={14} weight="bold" />
							Add Collection
						</button>
						<span id="add-album-tip" role="tooltip" class="add-album-tip">
							Collections group related items together within a category.
						</span>
					</span>
				{/if}
			</div>

			{#if filteredItems.length === 0}
				{#if isSearching}
					<EmptyState
						title="No matches"
						description={`Nothing in your catalog matches “${query.trim()}”, including items inside collections.`}
					/>
				{:else}
					<EmptyState title={emptyTitle} description={emptyDescription} />
				{/if}
			{:else}
				<div class={gridClass}>
					{#each filteredItems as item (item.id)}
						<div class="flex h-full min-w-0 flex-col">
							{#if category === 'movie' || category === 'show'}
								<MovieCard
									{item}
									{isAdmin}
									{albums}
									highlighted={highlightedId === item.id}
									{showAlbumWatchedToggle}
									showCollectionLink={isSearching}
									{genreCatalogItems}
								/>
							{:else}
								<MediaCard
									{item}
									{isAdmin}
									{albums}
									highlighted={highlightedId === item.id}
									{showAlbumWatchedToggle}
									showCollectionLink={isSearching}
								/>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.media-grid {
		display: flex;
		flex-direction: column;
	}

	.media-grid__search {
		margin-bottom: 1.5rem;
	}

	.media-grid__body {
		min-width: 0;
	}

	.add-album-tip {
		position: absolute;
		top: calc(100% + 0.45rem);
		right: 0;
		z-index: 20;
		width: max-content;
		max-width: 13.5rem;
		padding: 0.55rem 0.8rem;
		border-radius: 1rem;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-surface-raised));
		color: rgb(var(--color-text-secondary));
		font-size: 0.65rem;
		font-weight: 600;
		line-height: 1.35;
		text-align: right;
		box-shadow: 0 8px 20px rgb(0 0 0 / 0.18);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s ease;
	}

	.add-album-wrap:hover .add-album-tip,
	.add-album-wrap:focus-within .add-album-tip {
		opacity: 1;
	}
</style>
