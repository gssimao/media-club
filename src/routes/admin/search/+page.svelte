<script lang="ts">
	import { CATEGORY_LABELS, type ListType, type MediaCategory } from '$lib/types/media';
	import type { SearchResult } from '$lib/types/media';
	import { LoaderCircle } from '@lucide/svelte';

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
		<p class="text-sm text-indigo-300">Admin</p>
		<h1 class="text-3xl font-semibold">Add from search</h1>
		<p class="mt-2 text-sm text-slate-400">
			Search TMDB, Discogs, or Open Library, then add results to your collection or wishlist.
		</p>
	</div>

	<div
		class="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 md:grid-cols-3"
	>
		<label class="space-y-2 text-sm">
			<span>Category</span>
			<select
				bind:value={category}
				onchange={() => runSearch(query)}
				class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
			>
				<option value="movie">Movies (TMDB)</option>
				<option value="music">Music (Discogs)</option>
				<option value="book">Books (Open Library)</option>
			</select>
		</label>

		<label class="space-y-2 text-sm md:col-span-2">
			<span>Search</span>
			<input
				type="search"
				value={query}
				oninput={(event) => handleInput(event.currentTarget.value)}
				placeholder="Start typing a title…"
				class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
			/>
		</label>

		<fieldset class="md:col-span-3">
			<legend class="mb-2 text-sm">Add to</legend>
			<div class="flex gap-4 text-sm">
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={listType} value="owned" />
					Collection
				</label>
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={listType} value="wishlist" />
					Wishlist
				</label>
			</div>
		</fieldset>
	</div>

	{#if addedMessage}
		<p class="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{addedMessage}</p>
	{/if}

	{#if errorMessage}
		<p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{errorMessage}</p>
	{/if}

	{#if loading}
		<p class="inline-flex items-center gap-2 text-sm text-slate-400">
			<LoaderCircle class="size-4 animate-spin" />
			Searching…
		</p>
	{/if}

	{#if results.length > 0}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each results as result (result.externalId)}
				<article
					class="flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
				>
					<div class="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-800">
						{#if result.coverUrl}
							<img src={result.coverUrl} alt="" class="h-full w-full object-cover" loading="lazy" />
						{/if}
					</div>
					<div class="flex flex-1 flex-col gap-3">
						<div>
							<h2 class="line-clamp-2 text-sm font-semibold">{result.title}</h2>
							{#if result.subtitle}
								<p class="mt-1 line-clamp-1 text-xs text-slate-400">{result.subtitle}</p>
							{/if}
							{#if result.year}
								<p class="mt-1 text-xs text-slate-500">{result.year}</p>
							{/if}
						</div>

						<form
							method="POST"
							action="/admin/items?/add"
							onsubmit={() => {
								addedMessage = `Added “${result.title}” to ${listType}.`;
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
								class="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400"
							>
								Add to {listType}
							</button>
						</form>
					</div>
				</article>
			{/each}
		</div>
	{:else if query.trim().length >= 2 && !loading}
		<p class="text-sm text-slate-400">No results found for “{query}”.</p>
	{/if}
</section>
