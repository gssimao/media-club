<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import ModalShell from '$lib/components/ModalShell.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import CoverImage from '$lib/components/CoverImage.svelte';
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
	import { Plus, VinylRecord, MagnifyingGlass, Pencil } from 'phosphor-svelte';

	interface Props {
		category: MediaCategory;
		isOpen: boolean;
		onClose: () => void;
		initialMode?: 'search' | 'manual';
	}

	let { category, isOpen, onClose, initialMode = 'search' }: Props = $props();

	const search = createMetadataSearch(() => ({ category }));

	let mode = $state<'search' | 'manual'>('search');
	let hideOwned = $state(false);
	let hideOnList = $state(false);
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
		if (isOpen) {
			mode = initialMode;
		} else {
			mode = 'search';
			search.resetState();
			search.query = '';
			hideOwned = false;
			hideOnList = false;
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

	const categoryApiLabel = $derived(CATEGORY_SEARCH_PROVIDERS[category]);
</script>

<ModalShell
	open={isOpen}
	title="Add media"
	description="Search {categoryApiLabel} or enter it manually"
	size="lg"
	{onClose}
>
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
				autofocus
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
			use:enhance={({ formData }) => {
				// Fresh id per submit so several manual adds in one session never collide.
				formData.set('externalId', `manual-${Date.now()}`);
				return async ({ result: actionResult }) => {
					if (actionResult.type === 'failure') {
						toast.error(String(actionResult.data?.message ?? 'Could not add item.'));
						return;
					}
					if (actionResult.type === 'error') {
						toast.error('Could not add item.');
						return;
					}
					toast.success(`Added "${manualTitle}" to the collection.`);
					manualTitle = '';
					manualSubtitle = '';
					manualYear = '';
					manualCoverUrl = '';
					await invalidateAll();
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
					min="1"
					max="2100"
					step="1"
					inputmode="numeric"
					placeholder="e.g. 1994"
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

			<!-- Phones: full-width buttons, primary action on top. Wider screens: a right-aligned row. -->
			<div class="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
				<button
					type="button"
					onclick={onClose}
					class="btn-secondary justify-center px-5 py-2.5 text-sm"
				>
					Cancel
				</button>
				<button type="submit" class="btn-primary justify-center px-5 py-2.5 text-sm">
					<Plus size={16} weight="bold" />
					Add to Collection
				</button>
			</div>
		</form>
	{/if}
</ModalShell>
