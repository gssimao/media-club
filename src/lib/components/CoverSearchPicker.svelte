<script lang="ts">
	import SearchBar from '$lib/components/SearchBar.svelte';
	import { formatApiErrorMessage } from '$lib/utils/api-error';
	import type { MediaCategory, SearchResult } from '$lib/types/media';

	interface Props {
		category: MediaCategory;
		placeholder?: string;
		onSelect?: (coverUrl: string, metadata?: Record<string, unknown>) => void;
	}

	let {
		category,
		placeholder = 'Search for a cover image…',
		onSelect
	}: Props = $props();

	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let loading = $state(false);
	let errorMessage = $state('');

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let abortController: AbortController | null = null;

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

	function handleSelect(result: SearchResult) {
		if (!result.coverUrl || !onSelect) return;
		onSelect(result.coverUrl, result.metadata);
	}
</script>

<div class="space-y-3">
	<SearchBar bind:value={query} {placeholder} onInput={handleInput} />

	{#if loading}
		<p class="text-xs font-medium text-[rgb(var(--color-text-secondary))]">Searching…</p>
	{:else if errorMessage}
		<p class="text-xs font-medium text-red-600 dark:text-red-400">{errorMessage}</p>
	{:else if results.length > 0}
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each results as result (result.externalId)}
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
	{:else if query.trim().length >= 2}
		<p class="text-xs font-medium text-[rgb(var(--color-text-secondary))]">
			No results for "{query.trim()}".
		</p>
	{/if}
</div>
