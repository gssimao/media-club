<script lang="ts">
	import { enhance } from '$app/forms';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import CoverImage from '$lib/components/CoverImage.svelte';
	import SearchFilterToggles from '$lib/components/SearchFilterToggles.svelte';
	import SearchLoadMoreButton from '$lib/components/SearchLoadMoreButton.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { CatalogStatus } from '$lib/types/media';
	import { createMetadataSearch } from '$lib/utils/metadata-search.svelte';
	import { effectiveCatalogStatus, filterSearchResults } from '$lib/utils/search-filters';
	import { Check, Plus, VinylRecord } from 'phosphor-svelte';

	interface Props {
		listId: string;
	}

	let { listId }: Props = $props();

	const search = createMetadataSearch(() => ({ category: 'movie', streamingListId: listId }));

	let hideOwned = $state(true);
	let hideOnList = $state(true);
	let localStatus = $state<Record<string, Partial<CatalogStatus>>>({});

	const visibleResults = $derived(
		filterSearchResults(search.results, {
			hideOwned,
			hideOnList,
			context: 'streaming',
			localStatus
		})
	);

	const hasActiveFilters = $derived(hideOwned || hideOnList);
	const allFilteredOut = $derived(
		search.results.length > 0 && visibleResults.length === 0 && hasActiveFilters && !search.loading
	);

	$effect(() => {
		search.resetPaginationOnFilterChange(hideOwned, hideOnList);
	});

	function handleAdded(externalId: string) {
		localStatus = {
			...localStatus,
			[externalId]: {
				...localStatus[externalId],
				onStreamingList: true
			}
		};
	}
</script>

<div class="space-y-4">
	<SearchBar
		bind:value={search.query}
		onInput={search.handleInput}
		placeholder="Search TMDB for movies to stream…"
	/>

	{#if search.query.trim().length >= 2}
		<SearchFilterToggles context="streaming" bind:hideOwned bind:hideOnList />
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
		<div class="grid gap-4 sm:grid-cols-2">
			{#each visibleResults as result (result.externalId)}
				{@const status = effectiveCatalogStatus(result, localStatus)}
				{@const searchGenres = Array.isArray(result.metadata?.genres)
					? (result.metadata.genres as string[])
					: []}
				<article class="surface-round flex gap-4 p-4">
					<div
						class="h-28 w-20 shrink-0 overflow-hidden rounded-[1.5rem] bg-[rgb(var(--color-bg))] dark:bg-stone-900"
					>
						{#if result.coverUrl}
							<CoverImage
								src={result.coverUrl}
								alt="{result.title} cover"
								class="h-full w-full object-cover"
							/>
						{/if}
					</div>
					<div class="flex flex-1 flex-col gap-3">
						<div class="flex-1">
							<h3 class="line-clamp-2 text-sm font-bold text-stone-900 dark:text-amber-50">
								{result.title}
							</h3>
							{#if result.year}
								<p class="mt-1 text-xs font-bold text-amber-700 dark:text-amber-400">
									{result.year}
								</p>
							{/if}
							{#if searchGenres.length > 0}
								<div class="mt-1.5 flex flex-wrap gap-1">
									{#each searchGenres as genre (genre)}
										<span
											class="rounded-full bg-sky-500/15 px-2 py-0.5 text-[9px] font-bold tracking-wide text-sky-800 uppercase dark:text-sky-300"
										>
											{genre}
										</span>
									{/each}
								</div>
							{/if}
							{#if status.owned}
								<p class="mt-1 text-[10px] font-bold text-stone-500 dark:text-stone-400">
									In your movie collection
								</p>
							{/if}
						</div>

						{#if status.onStreamingList}
							<span
								class="inline-flex w-fit items-center gap-1 rounded-full bg-stone-200/80 px-2.5 py-1.5 text-[10px] font-bold text-stone-600 dark:bg-stone-700 dark:text-stone-300"
							>
								<Check size={11} weight="bold" aria-hidden="true" />
								Already on list
							</span>
						{:else}
							<form
								method="POST"
								action="?/addItem"
								use:enhance={() => {
									return async ({ result: actionResult, update }) => {
										if (actionResult.type === 'failure') {
											toast.error(String(actionResult.data?.message ?? 'Could not add movie.'));
										} else {
											toast.success(`Added "${result.title}" to this streaming list.`);
											handleAdded(result.externalId);
										}
										await update();
									};
								}}
							>
								<input type="hidden" name="listId" value={listId} />
								<input type="hidden" name="externalId" value={result.externalId} />
								<input type="hidden" name="title" value={result.title} />
								<input type="hidden" name="subtitle" value={result.subtitle ?? ''} />
								<input type="hidden" name="year" value={result.year ?? ''} />
								<input type="hidden" name="coverUrl" value={result.coverUrl ?? ''} />
								<input
									type="hidden"
									name="metadata"
									value={result.metadata ? JSON.stringify(result.metadata) : ''}
								/>
								<button
									type="submit"
									class="btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
								>
									<Plus size={12} weight="bold" />
									Add to list
								</button>
							</form>
						{/if}
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
