<script lang="ts">
	import { mediaGridClass } from '$lib/utils/media-grid';
	import PageShell from '$lib/components/PageShell.svelte';
	import AddStreamingDialog from '$lib/components/AddStreamingDialog.svelte';
	import AlbumRandomPicker from '$lib/components/AlbumRandomPicker.svelte';
	import GenreFilter from '$lib/components/GenreFilter.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import StreamingListItemCard from '$lib/components/StreamingListItemCard.svelte';
	import StreamingSearchPanel from '$lib/components/StreamingSearchPanel.svelte';
	import { TMDB_ATTRIBUTION } from '$lib/types/tmdb';
	import type { StreamingListItemView } from '$lib/server/streaming-lists';
	import {
		collectUniqueGenres,
		DEFAULT_GENRE_FILTER_MODE,
		itemMatchesGenreFilter,
		getDisplayGenres,
		type GenreFilterMode
	} from '$lib/utils/movie-genres';
	import { settings } from '$lib/stores/settings.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import { MagnifyingGlass, Pencil } from 'phosphor-svelte';

	let { data } = $props();

	let query = $state('');
	let selectedGenres = $state<string[]>([]);
	let genreFilterMode = $state<GenreFilterMode>(DEFAULT_GENRE_FILTER_MODE);

	const genreOptions = $derived(collectUniqueGenres(data.items));

	function filterByGenre(items: StreamingListItemView[]) {
		items = items.filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase()));
		if (selectedGenres.length === 0) return items;
		return items.filter((item) =>
			itemMatchesGenreFilter(getDisplayGenres(item), selectedGenres, genreFilterMode)
		);
	}

	const unwatchedItems = $derived(
		filterByGenre(data.items.filter((item: StreamingListItemView) => !item.watchedAt))
	);
	const watchedItems = $derived(
		filterByGenre(data.items.filter((item: StreamingListItemView) => item.watchedAt))
	);

	let highlightedId = $state<string | null>(null);
	let showSearch = $state(false);
	let showManualDialog = $state(false);

	function handlePick(item: { id: string; title: string }) {
		highlightedId = item.id;
		requestAnimationFrame(() => {
			document.getElementById(`streaming-item-${item.id}`)?.scrollIntoView({
				behavior: settings.reducedMotion ? 'instant' : 'smooth',
				block: 'center'
			});
		});
	}
</script>

<svelte:head>
	<title>{data.list.title} · Streaming · Media Club</title>
</svelte:head>

<PageShell title={data.list.title} description={data.list.description ?? undefined}>
	{#snippet controls()}
		<NavLink href="/movies/streaming" variant="accent">All streaming lists</NavLink>
		<NavLink href="/movies">Owned movies</NavLink>

		<AlbumRandomPicker
			{unwatchedItems}
			category="movie"
			isAdmin={data.isAdmin}
			onPick={handlePick}
			markWatchedAction="?/toggleWatched"
		/>

		{#if genreOptions.length > 0}
			<GenreFilter
				options={genreOptions}
				bind:selectedGenres
				bind:genreFilterMode
				onFilterChange={(genres, mode) => {
					selectedGenres = genres;
					genreFilterMode = mode;
				}}
			/>
		{/if}

		{#if data.isAdmin}
			<button
				type="button"
				class="pill-nav control-pill--primary"
				onclick={() => (showSearch = !showSearch)}
			>
				<MagnifyingGlass size={16} weight="bold" />
				{showSearch ? 'Hide search' : 'Add from search'}
			</button>
			<button
				type="button"
				class="pill-nav control-pill--secondary"
				onclick={() => (showManualDialog = true)}
			>
				<Pencil size={16} weight="bold" />
				Manual entry
			</button>
		{/if}
	{/snippet}

	{#if data.isAdmin && showSearch}
		<div class="surface-round mb-8 p-5">
			<StreamingSearchPanel listId={data.list.id} />
		</div>
	{/if}

	<div class="mb-6"><SearchBar bind:value={query} onInput={(value) => (query = value)} /></div>
	{#if data.items.length > 0 && !unwatchedItems.length && !watchedItems.length}<p
			class="surface-round p-6 text-sm"
		>
			No movies match your search and filters.
		</p>{/if}
	{#if data.items.length === 0}
		<div class="surface-round p-8 text-center">
			<p class="text-sm font-medium text-stone-600 dark:text-stone-400">
				This streaming list is empty.{#if data.isAdmin}
					Search or use manual entry to add subscription movies.{/if}
			</p>
		</div>
	{:else}
		{#if unwatchedItems.length > 0}
			<h2
				class="mb-4 text-sm font-black tracking-wide text-stone-700 uppercase dark:text-stone-300"
			>
				To watch
			</h2>
			<div class="mb-10 {mediaGridClass(settings.density)}">
				{#each unwatchedItems as item (item.id)}
					<div
						class="flex h-full min-w-0 flex-col {highlightedId === item.id
							? 'rounded-[2rem] ring-4 ring-amber-400/60 ring-offset-2 ring-offset-[rgb(var(--color-bg))]'
							: ''}"
					>
						<StreamingListItemCard
							{item}
							watchProviders={data.watchProvidersByExternalId[item.externalId]}
							isAdmin={data.isAdmin}
							genreCatalogItems={data.items}
						/>
					</div>
				{/each}
			</div>
		{/if}

		{#if watchedItems.length > 0}
			<h2
				class="mb-4 text-sm font-black tracking-wide text-stone-700 uppercase dark:text-stone-300"
			>
				Already watched
			</h2>
			<div class="opacity-75 {mediaGridClass(settings.density)}">
				{#each watchedItems as item (item.id)}
					<div class="flex h-full min-w-0 flex-col">
						<StreamingListItemCard
							{item}
							watchProviders={data.watchProvidersByExternalId[item.externalId]}
							isAdmin={data.isAdmin}
							genreCatalogItems={data.items}
						/>
					</div>
				{/each}
			</div>
		{/if}
	{/if}

	{#if data.items.length > 0}
		<p class="mt-8 text-center text-[10px] text-stone-500 dark:text-stone-400">
			{TMDB_ATTRIBUTION}
		</p>
	{/if}
</PageShell>

{#if data.isAdmin}<AddStreamingDialog
		listId={data.list.id}
		isOpen={showManualDialog}
		onClose={() => (showManualDialog = false)}
	/>
{/if}
