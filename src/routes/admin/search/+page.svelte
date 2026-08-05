<script lang="ts">
	import { CATEGORY_LABELS, type ListType, type MediaCategory } from '$lib/types/media';
	import type { SearchResult } from '$lib/types/media';
	import { LoaderCircle, Plus, CheckCircle2 } from '@lucide/svelte';

	let category = $state<MediaCategory>('movie');
	let listType = $state<ListType>('owned');
	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let loading = $state(false);
	let errorMessage = $state('');
	let addedMessage = $state('');

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	async function runSearch(value: string) {
		const trimmed = value.trim();
		if (trimmed.length < 2) {
			results = [];
			return;
		}

		loading = true;
		errorMessage = '';

		try {
			const response = await fetch(
				`/api/search?category=${category}&q=${encodeURIComponent(trimmed)}`
			);

			if (!response.ok) {
				const text = await response.text();
				throw new Error(text || `Search failed (${response.status})`);
			}

			const data = (await response.json()) as { results: SearchResult[] };
			results = data.results;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Search failed';
			results = [];
		} finally {
			loading = false;
		}
	}

	function handleInput(value: string) {
		query = value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => runSearch(value), 350);
	}
</script>

<svelte:head>
	<title>Add items · Media Club</title>
</svelte:head>

<section class="space-y-6">
	<div>
		<div
			class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400"
		>
			Admin
		</div>
		<h1 class="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Add from search</h1>
		<p class="mt-2 text-sm text-slate-600 dark:text-zinc-400">
			Search TMDB, Discogs, or Open Library, then add results to the collection or wishlist.
		</p>
	</div>

	<div
		class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-3"
	>
		<label class="space-y-2 text-sm">
			<span class="font-medium text-slate-700 dark:text-zinc-300">Category</span>
			<select
				bind:value={category}
				onchange={() => runSearch(query)}
				class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
			>
				<option value="movie">Movies (TMDB)</option>
				<option value="music">Music (Discogs)</option>
				<option value="book">Books (Open Library)</option>
			</select>
		</label>

		<label class="space-y-2 text-sm md:col-span-2">
			<span class="font-medium text-slate-700 dark:text-zinc-300">Search</span>
			<input
				type="search"
				value={query}
				oninput={(event) => handleInput(event.currentTarget.value)}
				placeholder="Start typing a title…"
				class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
			/>
		</label>

		<fieldset class="md:col-span-3">
			<legend class="mb-2 text-sm font-medium text-slate-700 dark:text-zinc-300">Add to</legend>
			<div class="flex gap-4 text-sm">
				<label
					class="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors {listType ===
					'owned'
						? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
						: 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}"
				>
					<input type="radio" bind:group={listType} value="owned" class="text-blue-600" />
					Collection
				</label>
				<label
					class="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors {listType ===
					'wishlist'
						? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
						: 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}"
				>
					<input type="radio" bind:group={listType} value="wishlist" class="text-blue-600" />
					Wishlist
				</label>
			</div>
		</fieldset>
	</div>

	{#if addedMessage}
		<div
			class="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
		>
			<CheckCircle2 class="size-4" />
			{addedMessage}
		</div>
	{/if}

	{#if errorMessage}
		<div
			class="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
		>
			{errorMessage}
		</div>
	{/if}

	{#if loading}
		<p class="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
			<LoaderCircle class="size-4 animate-spin" />
			Searching…
		</p>
	{/if}

	{#if results.length > 0}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each results as result (result.externalId)}
				<article
					class="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
				>
					<div
						class="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-zinc-800"
					>
						{#if result.coverUrl}
							<img src={result.coverUrl} alt="" class="h-full w-full object-cover" loading="lazy" />
						{/if}
					</div>
					<div class="flex flex-1 flex-col gap-3">
						<div class="flex-1">
							<h2 class="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
								{result.title}
							</h2>
							{#if result.subtitle}
								<p class="mt-1 line-clamp-1 text-xs text-slate-600 dark:text-zinc-400">
									{result.subtitle}
								</p>
							{/if}
							{#if result.year}
								<p class="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-500">
									{result.year}
								</p>
							{/if}
						</div>

						<form
							method="POST"
							action="/admin/items?/add"
							onsubmit={() => {
								addedMessage = `Added "${result.title}" to ${listType}.`;
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
							<button
								type="submit"
								class="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
							>
								<Plus class="size-3" />
								Add to {listType}
							</button>
						</form>
					</div>
				</article>
			{/each}
		</div>
	{:else if query.trim().length >= 2 && !loading}
		<p class="text-sm text-slate-600 dark:text-zinc-400">No results found for "{query}".</p>
	{/if}
</section>
