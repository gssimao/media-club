<script lang="ts">
	import Fuse from 'fuse.js';
	import type { Album, MediaItem } from '$lib/types/media';
	import { settings } from '$lib/stores/settings.svelte';
	import EmptyState from './EmptyState.svelte';
	import MediaCard from './MediaCard.svelte';
	import SearchBar from './SearchBar.svelte';

	interface Props {
		items: MediaItem[];
		isAdmin: boolean;
		albums?: Album[];
		emptyTitle: string;
		emptyDescription: string;
		highlightedId?: string | null;
		showAlbumWatchedToggle?: boolean;
		sectionTitle?: string;
		showSearch?: boolean;
	}

	let {
		items,
		isAdmin,
		albums = [],
		emptyTitle,
		emptyDescription,
		highlightedId = null,
		showAlbumWatchedToggle = false,
		sectionTitle,
		showSearch = true
	}: Props = $props();

	let query = $state('');

	const fuse = $derived(
		new Fuse(items, {
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
	{#if showSearch}
		<div class="media-grid__search">
			<SearchBar bind:value={query} onInput={(value) => (query = value)} />
		</div>
	{/if}

	<div class="media-grid__body space-y-6">
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

		{#if filteredItems.length === 0}
			{#if query.trim()}
				<EmptyState
					title="No matches"
					description={`Nothing in this list matches “${query.trim()}”.`}
				/>
			{:else}
				<EmptyState title={emptyTitle} description={emptyDescription} />
			{/if}
		{:else}
			<div class={gridClass}>
				{#each filteredItems as item, index (item.id)}
					<div class="anim-rise min-w-0" style="--rise-delay: {Math.min(index * 40, 400)}ms">
						<MediaCard
							{item}
							{isAdmin}
							{albums}
							highlighted={highlightedId === item.id}
							{showAlbumWatchedToggle}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
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
</style>
