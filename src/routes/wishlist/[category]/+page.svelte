<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import { CATEGORY_PATHS } from '$lib/types/media';
	import { FilmStrip, VinylRecord, BookOpen } from 'phosphor-svelte';

	let { data } = $props();

	const ownedHref = $derived(`/${CATEGORY_PATHS[data.category]}`);
</script>

<svelte:head>
	<title>{data.label} Wishlist · Media Club</title>
</svelte:head>

<PageShell title="{data.label} Wishlist">
	{#snippet controls()}
		<NavLink href={ownedHref} variant="accent">View collection →</NavLink>

		<div class="flex flex-col items-start gap-2">
			<NavLink href="/wishlist/movies" active={data.category === 'movie'}>
				<FilmStrip size={16} weight="bold" />
				Movies
			</NavLink>
			<NavLink href="/wishlist/music" active={data.category === 'music'}>
				<VinylRecord size={16} weight="bold" />
				Music
			</NavLink>
			<NavLink href="/wishlist/books" active={data.category === 'book'}>
				<BookOpen size={16} weight="bold" />
				Books
			</NavLink>
		</div>
	{/snippet}

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		emptyTitle="Wishlist is empty"
		emptyDescription="Save things to buy here. Admins can move items into the collection later."
	/>
</PageShell>
