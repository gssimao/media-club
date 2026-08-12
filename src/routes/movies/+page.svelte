<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import AlbumShelf from '$lib/components/AlbumShelf.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import { Heart } from 'phosphor-svelte';

	let { data } = $props();

	const emptyTitle = $derived(
		data.albums.length > 0 && data.items.length === 0
			? 'All movies are in albums'
			: 'No movies yet'
	);
	const emptyDescription = $derived(
		data.albums.length > 0 && data.items.length === 0
			? 'Browse albums above or open an album to see grouped titles.'
			: "When you're logged in as admin, add movies from the Admin panel."
	);
</script>

<svelte:head>
	<title>Movies · Media Club</title>
</svelte:head>

<PageShell title="Movies">
	{#snippet controls()}
		<a
			href="/albums/movie"
			class="pill-nav bg-amber-400/10 text-amber-600 hover:bg-amber-400/20 dark:text-amber-400"
		>
			View albums
		</a>
		<a
			href="/wishlist/movies"
			class="pill-nav bg-amber-400/10 text-amber-600 hover:bg-amber-400/20 dark:text-amber-400"
		>
			<Heart size={16} weight="bold" />
			View wishlist
		</a>
	{/snippet}

	<AlbumShelf albums={data.albums} category="movie" coverUrls={data.coverUrls} />

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		albums={data.albums}
		{emptyTitle}
		{emptyDescription}
	/>
</PageShell>
