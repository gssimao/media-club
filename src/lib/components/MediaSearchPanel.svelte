<script lang="ts">
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SearchFilterToggles from '$lib/components/SearchFilterToggles.svelte';
	import SearchLoadMoreButton from '$lib/components/SearchLoadMoreButton.svelte';
	import SearchResultAddButtons from '$lib/components/SearchResultAddButtons.svelte';
	import {
		type CatalogStatus,
		type ListType,
		type MediaCategory,
		type SearchPanelContext
	} from '$lib/types/media';
	import { createMetadataSearch } from '$lib/utils/metadata-search.svelte';
	import { effectiveCatalogStatus, filterSearchResults } from '$lib/utils/search-filters';
	import { VinylRecord } from 'phosphor-svelte';

	interface Props {
		category: MediaCategory;
		context?: SearchPanelContext;
		reloadOnAdd?: boolean;
	}

	let { category, context = 'admin', reloadOnAdd = false }: Props = $props();

	const search = createMetadataSearch(() => ({ category }));

	let hideOwned = $state(true);
	let hideOnList = $state(true);
	let localStatus = $state<Record<string, Partial<CatalogStatus>>>({});

	const visibleResults = $derived(
		filterSearchResults(search.results, { hideOwned, hideOnList, context, localStatus })
	);

	const hasActiveFilters = $derived(hideOwned || hideOnList);
	const allFilteredOut = $derived(
		search.results.length > 0 && visibleResults.length === 0 && hasActiveFilters && !search.loading
	);

	$effect(() => {
		search.resetPaginationOnFilterChange(hideOwned, hideOnList);
	});

	function handleAdded(externalId: string, listType: ListType) {
		localStatus = {
			...localStatus,
			[externalId]: {
				...localStatus[externalId],
				[listType]: true
			}
		};
	}
</script>

<div class="space-y-4">
	<SearchBar
		bind:value={search.query}
		onInput={search.handleInput}
		placeholder="Start typing a title…"
	/>

	{#if search.query.trim().length >= 2}
		<SearchFilterToggles {context} bind:hideOwned bind:hideOnList />
	{/if}

	{#if search.loading}
		<p
			class="inline-flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400"
		>
			<VinylRecord
				size={18}
				weight="bold"
				class="animate-spin text-amber-500 [animation-duration:1.4s]"
			/>
			Spinning up results…
		</p>
	{/if}

	{#if visibleResults.length > 0}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each visibleResults as result (result.externalId)}
				{@const status = effectiveCatalogStatus(result, localStatus)}
				<article class="surface-round flex gap-4 p-4">
					<div
						class="h-28 w-20 shrink-0 overflow-hidden rounded-[1.5rem] bg-[rgb(var(--color-bg))] dark:bg-stone-900"
					>
						{#if result.coverUrl}
							<img
								src={result.coverUrl}
								alt="{result.title} cover"
								class="h-full w-full object-cover"
								loading="lazy"
							/>
						{/if}
					</div>
					<div class="flex flex-1 flex-col gap-3">
						<div class="flex-1">
							<h3 class="line-clamp-2 text-sm font-bold text-stone-900 dark:text-amber-50">
								{result.title}
							</h3>
							{#if result.subtitle}
								<p class="mt-1 line-clamp-1 text-xs font-medium text-stone-600 dark:text-stone-400">
									{result.subtitle}
								</p>
							{/if}
							{#if result.year}
								<p class="mt-1 text-xs font-bold text-amber-700 dark:text-amber-400">
									{result.year}
								</p>
							{/if}
						</div>

						<SearchResultAddButtons
							{result}
							{category}
							catalogStatus={status}
							{reloadOnAdd}
							onAdded={(listType) => handleAdded(result.externalId, listType)}
						/>
					</div>
				</article>
			{/each}
		</div>

		<SearchLoadMoreButton
			hasMore={search.hasMore}
			loadingMore={search.loadingMore}
			onLoadMore={search.loadMore}
		/>
	{:else if allFilteredOut}
		<p class="text-sm font-medium text-stone-600 dark:text-stone-400">
			All results are hidden by your filters. Turn off a filter above to see matches for "{search.query}".
		</p>

		<SearchLoadMoreButton
			hasMore={search.hasMore}
			loadingMore={search.loadingMore}
			onLoadMore={search.loadMore}
		/>
	{:else if search.query.trim().length >= 2 && !search.loading}
		<p class="text-sm font-medium text-stone-600 dark:text-stone-400">
			No results found for "{search.query}".
		</p>
	{/if}
</div>
