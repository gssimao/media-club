<script lang="ts">
	import { enhance } from '$app/forms';
	import PageShell from '$lib/components/PageShell.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import { type ListType, type MediaCategory } from '$lib/types/media';
	import type { SearchResult } from '$lib/types/media';
	import { Plus, CheckCircle, VinylRecord } from 'phosphor-svelte';

	let category = $state<MediaCategory>('movie');
	let listType = $state<ListType>('owned');
	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let loading = $state(false);
	let errorMessage = $state('');
	let addedMessage = $state('');

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let abortController: AbortController | null = null;

	$effect(() => {
		return () => {
			clearTimeout(debounceTimer);
			abortController?.abort();
		};
	});

	async function runSearch(value: string) {
		// Cancel any in-flight request so a slow response can't overwrite a newer one.
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
				throw new Error(text || `Search failed (${response.status})`);
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

	function handleCategoryChange() {
		clearTimeout(debounceTimer);
		runSearch(query);
	}
</script>

<svelte:head>
	<title>Add items · Media Club</title>
</svelte:head>

<PageShell
	title="Add from search"
	description="Search TMDB, Discogs, or Open Library, then add results to the collection or wishlist."
>
	{#snippet controls()}
		<label class="space-y-2 text-sm">
			<span class="font-bold text-stone-700 dark:text-stone-300">Category</span>
			<select bind:value={category} onchange={handleCategoryChange} class="input-round w-full">
				<option value="movie">Movies (TMDB)</option>
				<option value="music">Music (Discogs)</option>
				<option value="book">Books (Open Library)</option>
			</select>
		</label>

		<fieldset>
			<legend class="mb-2 text-sm font-bold text-stone-700 dark:text-stone-300">Add to</legend>
			<div class="flex flex-col items-start gap-2 text-sm">
				<label
					class="inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors {listType ===
					'owned'
						? 'bg-amber-400 font-bold text-stone-900'
						: 'font-medium text-stone-700 hover:bg-[rgb(var(--color-accent-light))] dark:text-stone-300 dark:hover:bg-stone-700'}"
				>
					<input type="radio" bind:group={listType} value="owned" class="accent-amber-500" />
					Collection
				</label>
				<label
					class="inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors {listType ===
					'wishlist'
						? 'bg-amber-400 font-bold text-stone-900'
						: 'font-medium text-stone-700 hover:bg-[rgb(var(--color-accent-light))] dark:text-stone-300 dark:hover:bg-stone-700'}"
				>
					<input type="radio" bind:group={listType} value="wishlist" class="accent-amber-500" />
					Wishlist
				</label>
			</div>
		</fieldset>
	{/snippet}

	<div class="space-y-6">
		<div class="space-y-2 text-sm">
			<span class="font-bold text-stone-700 dark:text-stone-300">Search</span>
			<SearchBar bind:value={query} onInput={handleInput} placeholder="Start typing a title…" />
		</div>

		{#if addedMessage}
			<div
				class="inline-flex items-center gap-2 rounded-full border border-emerald-400 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
			>
				<CheckCircle size={16} weight="bold" />
				{addedMessage}
			</div>
		{/if}

		{#if errorMessage}
			<div
				class="rounded-[2rem] border border-red-400 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
			>
				{errorMessage}
			</div>
		{/if}

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
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each results as result, index (result.externalId)}
					<article
						class="surface-round anim-rise flex gap-4 p-4"
						style="--rise-delay: {Math.min(index * 40, 320)}ms"
					>
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
								<h2 class="line-clamp-2 text-sm font-bold text-stone-900 dark:text-amber-50">
									{result.title}
								</h2>
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
											errorMessage = String(actionResult.data?.message ?? 'Could not add item.');
										} else {
											addedMessage = `Added "${result.title}" to ${listType === 'owned' ? 'the collection' : 'the wishlist'}.`;
										}
										await update();
									};
								}}
							>
								<input type="hidden" name="category" value={category} />
								<input type="hidden" name="listType" value={listType} />
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
									Add to {listType}
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
</PageShell>
