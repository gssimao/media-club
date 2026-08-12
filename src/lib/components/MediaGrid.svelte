<script lang="ts">
	import Fuse from 'fuse.js';
	import type { Album, MediaItem } from '$lib/types/media';
	import MediaCard from './MediaCard.svelte';
	import SearchBar from './SearchBar.svelte';

	interface Props {
		items: MediaItem[];
		isAdmin: boolean;
		albums?: Album[];
		emptyTitle: string;
		emptyDescription: string;
	}

	let { items, isAdmin, albums = [], emptyTitle, emptyDescription }: Props = $props();

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
</script>

<div class="media-grid">
	<div class="media-grid__search">
		<SearchBar bind:value={query} onInput={(value) => (query = value)} />
	</div>

	<div class="media-grid__body space-y-6">
		<p class="text-sm font-bold tracking-wide text-stone-600 uppercase dark:text-stone-400">
			{filteredItems.length === 1 ? '1 item' : `${filteredItems.length} items`}
		</p>

		{#if filteredItems.length === 0}
			<div class="surface-round border-dashed px-6 py-16 text-center">
				<h2 class="text-lg font-black text-stone-900 uppercase dark:text-white">{emptyTitle}</h2>
				<p class="mt-2 text-sm font-medium text-stone-600 dark:text-stone-400">
					{emptyDescription}
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{#each filteredItems as item (item.id)}
					<MediaCard {item} {isAdmin} {albums} />
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
