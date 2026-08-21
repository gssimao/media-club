<script lang="ts">
	import { enhance } from '$app/forms';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SearchFilterToggles from '$lib/components/SearchFilterToggles.svelte';
	import SearchLoadMoreButton from '$lib/components/SearchLoadMoreButton.svelte';
	import SearchResultAddButtons from '$lib/components/SearchResultAddButtons.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import {
		type CatalogStatus,
		CATEGORY_SEARCH_PROVIDERS,
		type ListType,
		type MediaCategory
	} from '$lib/types/media';
	import { createMetadataSearch } from '$lib/utils/metadata-search.svelte';
	import { effectiveCatalogStatus, filterSearchResults } from '$lib/utils/search-filters';
	import { Plus, VinylRecord, X, MagnifyingGlass, Pencil } from 'phosphor-svelte';

	interface Props {
		category: MediaCategory;
		isOpen: boolean;
		onClose: () => void;
	}

	let { category, isOpen, onClose }: Props = $props();

	const search = createMetadataSearch(() => ({ category }));

	let mode = $state<'search' | 'manual'>('search');
	let hideOwned = $state(true);
	let hideOnList = $state(true);
	let localStatus = $state<Record<string, Partial<CatalogStatus>>>({});

	const visibleResults = $derived(
		filterSearchResults(search.results, {
			hideOwned,
			hideOnList,
			context: 'owned-add',
			localStatus
		})
	);

	const hasActiveFilters = $derived(hideOwned || hideOnList);
	const allFilteredOut = $derived(
		search.results.length > 0 && visibleResults.length === 0 && hasActiveFilters && !search.loading
	);

	function handleAdded(externalId: string, listType: ListType) {
		localStatus = {
			...localStatus,
			[externalId]: {
				...localStatus[externalId],
				[listType]: true
			}
		};
	}

	// Manual entry fields
	let manualTitle = $state('');
	let manualSubtitle = $state('');
	let manualYear = $state('');
	let manualCoverUrl = $state('');

	$effect(() => {
		if (!isOpen) {
			mode = 'search';
			search.resetState();
			search.query = '';
			hideOwned = true;
			hideOnList = true;
			localStatus = {};
			manualTitle = '';
			manualSubtitle = '';
			manualYear = '';
			manualCoverUrl = '';
		}
	});

	$effect(() => {
		search.resetPaginationOnFilterChange(hideOwned, hideOnList);
	});

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	const categoryApiLabel = $derived(CATEGORY_SEARCH_PROVIDERS[category]);
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
		tabindex="-1"
	>
		<div
			class="surface-round relative max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="mb-6 flex items-start justify-between">
				<div>
					<h2 id="dialog-title" class="text-2xl font-bold text-stone-900 dark:text-amber-50">
						Add to Collection
					</h2>
					<p class="mt-1 text-sm font-medium text-stone-600 dark:text-stone-400">
						Search {categoryApiLabel} or enter manually
					</p>
				</div>
				<button
					onclick={onClose}
					class="rounded-full p-2 transition-colors hover:bg-stone-200 dark:hover:bg-stone-700"
					aria-label="Close dialog"
				>
					<X size={24} weight="bold" />
				</button>
			</div>

			<div class="mb-6 flex gap-2">
				<button
					onclick={() => (mode = 'search')}
					class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors {mode ===
					'search'
						? 'bg-amber-400 text-stone-900'
						: 'bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600'}"
				>
					<MagnifyingGlass size={16} weight="bold" />
					Search
				</button>
				<button
					onclick={() => (mode = 'manual')}
					class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors {mode ===
					'manual'
						? 'bg-amber-400 text-stone-900'
						: 'bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600'}"
				>
					<Pencil size={16} weight="bold" />
					Manual Entry
				</button>
			</div>

			{#if mode === 'search'}
				<div class="space-y-4">
					<SearchBar
						bind:value={search.query}
						onInput={search.handleInput}
						placeholder="Start typing a title…"
					/>

					{#if search.query.trim().length >= 2}
						<SearchFilterToggles context="owned-add" bind:hideOwned bind:hideOnList />
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
												<p
													class="mt-1 line-clamp-1 text-xs font-medium text-stone-600 dark:text-stone-400"
												>
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
											reloadOnAdd
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
			{:else}
				<form
					method="POST"
					action="/admin/items?/add"
					class="space-y-4"
					use:enhance={() => {
						return async ({ result: actionResult, update }) => {
							if (actionResult.type === 'failure') {
								toast.error(String(actionResult.data?.message ?? 'Could not add item.'));
							} else {
								toast.success(`Added "${manualTitle}" to the collection.`);
								manualTitle = '';
								manualSubtitle = '';
								manualYear = '';
								manualCoverUrl = '';
								setTimeout(() => {
									window.location.reload();
								}, 1000);
							}
							await update();
						};
					}}
				>
					<input type="hidden" name="category" value={category} />
					<input type="hidden" name="listType" value="owned" />
					<input type="hidden" name="externalId" value="manual-{Date.now()}" />

					<label class="block space-y-1 text-sm">
						<span class="font-bold text-stone-700 dark:text-stone-300">Title *</span>
						<input
							type="text"
							name="title"
							bind:value={manualTitle}
							required
							placeholder="Enter title"
							class="input-round w-full"
						/>
					</label>

					<label class="block space-y-1 text-sm">
						<span class="font-bold text-stone-700 dark:text-stone-300">Subtitle</span>
						<input
							type="text"
							name="subtitle"
							bind:value={manualSubtitle}
							placeholder="Optional subtitle"
							class="input-round w-full"
						/>
					</label>

					<label class="block space-y-1 text-sm">
						<span class="font-bold text-stone-700 dark:text-stone-300">Year</span>
						<input
							type="number"
							name="year"
							bind:value={manualYear}
							min="2000"
							step="1"
							placeholder="e.g. 2024"
							class="input-round w-full"
						/>
					</label>

					<label class="block space-y-1 text-sm">
						<span class="font-bold text-stone-700 dark:text-stone-300">Cover URL</span>
						<input
							type="url"
							name="coverUrl"
							bind:value={manualCoverUrl}
							placeholder="https://example.com/cover.jpg"
							class="input-round w-full"
						/>
					</label>

					<div class="flex justify-end gap-2 pt-2">
						<button
							type="button"
							onclick={onClose}
							class="rounded-full px-5 py-2.5 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-700"
						>
							Cancel
						</button>
						<button type="submit" class="btn-primary px-5 py-2.5 text-sm">
							<Plus size={16} weight="bold" />
							Add to Collection
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}
