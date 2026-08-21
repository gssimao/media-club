<script lang="ts">
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SearchLoadMoreButton from '$lib/components/SearchLoadMoreButton.svelte';
	import type { MediaCategory, SearchResult } from '$lib/types/media';
	import { createMetadataSearch } from '$lib/utils/metadata-search.svelte';

	interface Props {
		category: MediaCategory;
		placeholder?: string;
		onSelect?: (coverUrl: string, metadata?: Record<string, unknown>) => void;
	}

	let { category, placeholder = 'Search for a cover image…', onSelect }: Props = $props();

	const search = createMetadataSearch(() => ({ category }));

	function handleSelect(result: SearchResult) {
		if (!result.coverUrl || !onSelect) return;
		onSelect(result.coverUrl, result.metadata);
	}
</script>

<div class="space-y-3">
	<SearchBar bind:value={search.query} {placeholder} onInput={search.handleInput} />

	{#if search.loading}
		<p class="text-xs font-medium text-[rgb(var(--color-text-secondary))]">Searching…</p>
	{:else if search.results.length > 0}
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each search.results as result (result.externalId)}
				<button
					type="button"
					class="surface-round group flex flex-col overflow-hidden p-2 text-left transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!result.coverUrl || !onSelect}
					onclick={() => handleSelect(result)}
				>
					<div
						class="aspect-[2/3] w-full overflow-hidden rounded-[1.5rem] bg-[rgb(var(--color-bg))] dark:bg-stone-900"
					>
						{#if result.coverUrl}
							<img
								src={result.coverUrl}
								alt="{result.title} cover"
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								loading="lazy"
							/>
						{:else}
							<div
								class="flex h-full items-center justify-center px-2 text-center text-[10px] font-semibold text-[rgb(var(--color-text-tertiary))]"
							>
								No image
							</div>
						{/if}
					</div>
					<p class="mt-2 line-clamp-2 text-[10px] font-bold text-stone-900 dark:text-amber-50">
						{result.title}
					</p>
					{#if result.year}
						<p class="text-[9px] font-bold text-amber-700 dark:text-amber-400">{result.year}</p>
					{/if}
				</button>
			{/each}
		</div>

		<SearchLoadMoreButton
			hasMore={search.hasMore}
			loadingMore={search.loadingMore}
			onLoadMore={search.loadMore}
		/>
	{:else if search.query.trim().length >= 2}
		<p class="text-xs font-medium text-[rgb(var(--color-text-secondary))]">
			No results for "{search.query.trim()}".
		</p>
	{/if}
</div>
