<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import AlbumShelf from '$lib/components/AlbumShelf.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import AddMediaDialog from '$lib/components/AddMediaDialog.svelte';
	import AddFolderDialog from '$lib/components/AddFolderDialog.svelte';
	import FormatFilter from '$lib/components/FormatFilter.svelte';
	import GenreFilter from '$lib/components/GenreFilter.svelte';
	import SuperchargedRandomPicker from '$lib/components/SuperchargedRandomPicker.svelte';
	import { CATEGORY_PATHS, type Album, type MediaCategory, type MediaItem } from '$lib/types/media';
	import {
		collectUniqueGenres,
		getDisplayGenres,
		itemMatchesGenreFilter
	} from '$lib/utils/movie-genres';
	import { FolderPlus, Heart, Plus } from 'phosphor-svelte';

	interface Props {
		category: MediaCategory;
		title: string;
		description?: string;
		items: MediaItem[];
		allItems: MediaItem[];
		albums: Album[];
		coverUrls: Record<string, string | null>;
		isAdmin: boolean;
		/** Plural noun for empty-state copy, e.g. "movies", "records", "books". */
		noun: string;
		/** Empty-state help text shown when the catalog has no items at all. */
		emptyDescription: string;
	}

	let {
		category,
		title,
		description,
		items,
		allItems,
		albums,
		coverUrls,
		isAdmin,
		noun,
		emptyDescription
	}: Props = $props();

	let showAddDialog = $state(false);
	let showFolderDialog = $state(false);
	let selectedFormats = $state<string[]>([]);
	let selectedGenres = $state<string[]>([]);

	const genreOptions = $derived(category === 'movie' ? collectUniqueGenres(allItems) : []);

	const allGrouped = $derived(albums.length > 0 && items.length === 0);
	const emptyTitle = $derived(allGrouped ? `All ${noun} are in collections` : `No ${noun} yet`);
	const emptyText = $derived(
		allGrouped
			? 'Browse the collections above or open one to see everything inside.'
			: emptyDescription
	);

	const filteredItems = $derived.by(() => applyFormatFilter(items));
	const filteredSearchItems = $derived.by(() => applyFormatFilter(allItems));
	const showShelfAddTile = $derived(isAdmin && albums.length > 0);

	function applyFormatFilter(source: MediaItem[]) {
		let filtered = source;

		if ((category === 'movie' || category === 'show') && selectedFormats.length > 0) {
			filtered = filtered.filter((item) => {
				const metadata = item.metadata as Record<string, unknown> | null;
				if (!metadata || !metadata.tags) return false;

				const tags = metadata.tags as string[];
				return selectedFormats.some((format) =>
					tags.some((tag) => tag === format || tag.includes(format) || format.includes(tag))
				);
			});
		}

		if (category === 'movie' && selectedGenres.length > 0) {
			filtered = filtered.filter((item) =>
				itemMatchesGenreFilter(getDisplayGenres(item), selectedGenres)
			);
		}

		return filtered;
	}

	function handleFilterChange(formats: string[]) {
		selectedFormats = formats;
	}

	function handleGenreFilterChange(genres: string[]) {
		selectedGenres = genres;
	}
</script>

<svelte:head>
	<title>{title} · Media Club</title>
</svelte:head>

<PageShell {title} {description}>
	{#snippet controls()}
		<NavLink href="/albums/{category}" variant="accent">View collections</NavLink>
		<NavLink href="/wishlist/{CATEGORY_PATHS[category]}" variant="accent">
			<Heart size={16} weight="bold" />
			View wishlist
		</NavLink>
		{#if isAdmin && (category === 'movie' || category === 'show')}
			<FormatFilter {category} {selectedFormats} onFilterChange={handleFilterChange} />
		{/if}
		{#if isAdmin && category === 'movie' && genreOptions.length > 0}
			<GenreFilter
				options={genreOptions}
				bind:selectedGenres
				onFilterChange={handleGenreFilterChange}
			/>
		{/if}
		{#if category === 'movie'}
			<SuperchargedRandomPicker items={allItems} {albums} {genreOptions} />
		{/if}
		{#if isAdmin}
			<button
				type="button"
				onclick={() => (showAddDialog = true)}
				class="pill-nav control-pill--primary"
			>
				<Plus size={16} weight="bold" />
				Add media
			</button>
			<button
				type="button"
				onclick={() => (showFolderDialog = true)}
				class="pill-nav control-pill--accent"
			>
				<FolderPlus size={16} weight="bold" />
				Create collection
			</button>
		{/if}
	{/snippet}

	<AlbumShelf
		{albums}
		{category}
		{coverUrls}
		showAddTile={showShelfAddTile}
		onAddCollection={() => (showFolderDialog = true)}
	/>

	<MediaGrid
		items={filteredItems}
		searchItems={filteredSearchItems}
		genreCatalogItems={category === 'movie' ? allItems : []}
		{category}
		{isAdmin}
		{albums}
		{emptyTitle}
		emptyDescription={emptyText}
		showAddFolderButton={isAdmin && albums.length === 0}
		onAddFolder={() => (showFolderDialog = true)}
	/>
</PageShell>

{#if isAdmin}
	<AddMediaDialog {category} isOpen={showAddDialog} onClose={() => (showAddDialog = false)} />
	<AddFolderDialog
		{category}
		isOpen={showFolderDialog}
		onClose={() => (showFolderDialog = false)}
	/>
{/if}
