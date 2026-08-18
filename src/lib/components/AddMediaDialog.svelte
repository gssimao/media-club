<script lang="ts">
	import { enhance } from '$app/forms';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import { formatApiErrorMessage } from '$lib/utils/api-error';
	import { type MediaCategory } from '$lib/types/media';
	import type { SearchResult } from '$lib/types/media';
	import { Plus, CheckCircle, VinylRecord, X, MagnifyingGlass, Pencil } from 'phosphor-svelte';

	interface Props {
		category: MediaCategory;
		isOpen: boolean;
		onClose: () => void;
	}

	let { category, isOpen, onClose }: Props = $props();

	let mode = $state<'search' | 'manual'>('search');
	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let loading = $state(false);
	let errorMessage = $state('');
	let addedMessage = $state('');

	// Manual entry fields
	let manualTitle = $state('');
	let manualSubtitle = $state('');
	let manualYear = $state('');
	let manualCoverUrl = $state('');

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let abortController: AbortController | null = null;

	$effect(() => {
		if (!isOpen) {
			// Reset state when dialog closes
			mode = 'search';
			query = '';
			results = [];
			loading = false;
			errorMessage = '';
			addedMessage = '';
			manualTitle = '';
			manualSubtitle = '';
			manualYear = '';
			manualCoverUrl = '';
		}
	});

	$effect(() => {
		return () => {
			clearTimeout(debounceTimer);
			abortController?.abort();
		};
	});

	async function runSearch(value: string) {
		abortController?.abort();

		const trimmed = value.trim();
		if (trimmed.length < 2) {
			results = [];
			loading = false;
			return;
		}

		const controller = new AbortController();
		abortController = controller;
		loading = true;
		errorMessage = '';

		try {
			const response = await fetch(
				`/api/search?category=${category}&q=${encodeURIComponent(trimmed)}`,
				{ signal: controller.signal }
			);

			if (!response.ok) {
				const text = await response.text();
				throw new Error(formatApiErrorMessage(text, `Search failed (${response.status})`));
			}

			const data = (await response.json()) as { results: SearchResult[] };
			results = data.results;
			loading = false;
		} catch (error) {
			if (controller.signal.aborted) return;
			errorMessage = error instanceof Error ? error.message : 'Search failed';
			results = [];
			loading = false;
		}
	}

	function handleInput(value: string) {
		query = value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => runSearch(value), 350);
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	const categoryApiLabel = $derived(
		category === 'movie' ? 'TMDB' : category === 'music' ? 'Discogs' : 'Open Library'
	);
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

			{#if addedMessage}
				<div
					class="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
				>
					<CheckCircle size={16} weight="bold" />
					{addedMessage}
				</div>
			{/if}

			{#if errorMessage}
				<div
					class="mb-4 rounded-[2rem] border border-red-400 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
				>
					{errorMessage}
				</div>
			{/if}

			{#if mode === 'search'}
				<div class="space-y-4">
					<SearchBar bind:value={query} onInput={handleInput} placeholder="Start typing a title…" />

					{#if loading}
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

					{#if results.length > 0}
						<div class="grid gap-4 sm:grid-cols-2">
							{#each results as result (result.externalId)}
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

										<form
											method="POST"
											action="/admin/items?/add"
											use:enhance={() => {
												addedMessage = '';
												errorMessage = '';
												return async ({ result: actionResult, update }) => {
													if (actionResult.type === 'failure') {
														errorMessage = String(
															actionResult.data?.message ?? 'Could not add item.'
														);
													} else {
														addedMessage = `Added "${result.title}" to the collection.`;
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
											<button type="submit" class="btn-primary px-3 py-1.5 text-xs">
												<Plus size={12} weight="bold" />
												Add
											</button>
										</form>
									</div>
								</article>
							{/each}
						</div>
					{:else if query.trim().length >= 2 && !loading}
						<p class="text-sm font-medium text-stone-600 dark:text-stone-400">
							No results found for "{query}".
						</p>
					{/if}
				</div>
			{:else}
				<form
					method="POST"
					action="/admin/items?/add"
					class="space-y-4"
					use:enhance={() => {
						addedMessage = '';
						errorMessage = '';
						return async ({ result: actionResult, update }) => {
							if (actionResult.type === 'failure') {
								errorMessage = String(actionResult.data?.message ?? 'Could not add item.');
							} else {
								addedMessage = `Added "${manualTitle}" to the collection.`;
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
