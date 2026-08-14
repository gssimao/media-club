<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import AlbumShelf from '$lib/components/AlbumShelf.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import { CATEGORY_PATHS, type Album, type MediaCategory, type MediaItem } from '$lib/types/media';
	import { Heart } from 'phosphor-svelte';

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

	const allGrouped = $derived(albums.length > 0 && items.length === 0);
	const emptyTitle = $derived(allGrouped ? `All ${noun} are in albums` : `No ${noun} yet`);
	const emptyText = $derived(
		allGrouped ? 'Browse the albums above or open one to see everything inside.' : emptyDescription
	);
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
	{/snippet}

	<AlbumShelf {albums} {category} {coverUrls} />

	<MediaGrid {items} {isAdmin} {albums} {emptyTitle} emptyDescription={emptyText} />
</PageShell>
