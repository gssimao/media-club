<script lang="ts">
	import Fuse from 'fuse.js';
	import type { MediaItem } from '$lib/types/media';
	import MediaCard from './MediaCard.svelte';
	import SearchBar from './SearchBar.svelte';

	interface Props {
		items: MediaItem[];
		isAdmin: boolean;
		emptyTitle: string;
		emptyDescription: string;
	}

	let { items, isAdmin, emptyTitle, emptyDescription }: Props = $props();

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

<div class="space-y-6">
	<SearchBar bind:value={query} onInput={(value) => (query = value)} />

	<p class="text-sm font-bold tracking-wide text-stone-600 uppercase dark:text-stone-400">
		{filteredItems.length === 1 ? '1 item' : `${filteredItems.length} items`}
	</p>

	{#if filteredItems.length === 0}
		<div
			class="surface-round border-dashed px-6 py-16 text-center"
		>
			<h2 class="text-lg font-black text-stone-900 uppercase dark:text-white">{emptyTitle}</h2>
			<p class="mt-2 text-sm font-medium text-stone-600 dark:text-stone-400">
				{emptyDescription}
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each filteredItems as item (item.id)}
				<MediaCard {item} {isAdmin} />
			{/each}
		</div>
	{/if}
</div>
