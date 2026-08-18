<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import AlbumShelf from '$lib/components/AlbumShelf.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import AddMediaDialog from '$lib/components/AddMediaDialog.svelte';
	import AddFolderDialog from '$lib/components/AddFolderDialog.svelte';
	import FormatFilter from '$lib/components/FormatFilter.svelte';
	import { CATEGORY_PATHS, type Album, type MediaCategory, type MediaItem } from '$lib/types/media';
	import { Heart, Plus } from 'phosphor-svelte';

	interface Props {
		category: MediaCategory;
		title: string;
		description?: string;
		items: MediaItem[];
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
		albums,
		coverUrls,
		isAdmin,
		noun,
		emptyDescription
	}: Props = $props();

	let showAddDialog = $state(false);
	let showFolderDialog = $state(false);
	let selectedFormats = $state<string[]>([]);

	const allGrouped = $derived(albums.length > 0 && items.length === 0);
	const emptyTitle = $derived(allGrouped ? `All ${noun} are in albums` : `No ${noun} yet`);
	const emptyText = $derived(
		allGrouped ? 'Browse the albums above or open one to see everything inside.' : emptyDescription
	);

	const filteredItems = $derived.by(() => {
		if (category !== 'movie' || selectedFormats.length === 0) {
			return items;
		}

		return items.filter((item) => {
			const metadata = item.metadata as Record<string, unknown> | null;
			if (!metadata || !metadata.tags) return false;

			const tags = metadata.tags as string[];
			return selectedFormats.some((format) => tags.includes(format));
		});
	});

	function handleFilterChange(formats: string[]) {
		selectedFormats = formats;
	}
</script>

<svelte:head>
	<title>{title} · Media Club</title>
</svelte:head>

<PageShell {title} {description}>
	{#snippet controls()}
		<NavLink href="/albums/{category}" variant="accent">View albums</NavLink>
		<NavLink href="/wishlist/{CATEGORY_PATHS[category]}" variant="accent">
			<Heart size={16} weight="bold" />
			View wishlist
		</NavLink>
		{#if isAdmin && category === 'movie'}
			<FormatFilter {selectedFormats} onFilterChange={handleFilterChange} />
		{/if}
		{#if isAdmin}
			<button
				onclick={() => (showAddDialog = true)}
				class="flex items-center gap-2 rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-surface))] px-4 py-2.5 text-sm font-bold text-[rgb(var(--color-text))] transition-colors hover:bg-[rgb(var(--color-accent-light))]"
			>
				<Plus size={16} weight="bold" />
				Add {category === 'movie' ? 'Movie' : category === 'music' ? 'Record' : 'Book'}
			</button>
		{/if}
	{/snippet}

	<AlbumShelf {albums} {category} {coverUrls} />

	<MediaGrid
		items={filteredItems}
		{isAdmin}
		{albums}
		{emptyTitle}
		emptyDescription={emptyText}
		showAddFolderButton={isAdmin}
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
