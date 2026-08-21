<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import MediaSearchPanel from '$lib/components/MediaSearchPanel.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import { CATEGORY_PATHS } from '$lib/types/media';
	import { FilmStrip, MagnifyingGlass, VinylRecord, BookOpen } from 'phosphor-svelte';

	let { data } = $props();

	const ownedHref = $derived(`/${CATEGORY_PATHS[data.category]}`);
	let showSearch = $state(false);
</script>

<svelte:head>
	<title>{data.label} Wishlist · Media Club</title>
</svelte:head>

<PageShell title="{data.label} Wishlist">
	{#snippet controls()}
		<NavLink href={ownedHref} variant="accent">View collection →</NavLink>

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

		{#if data.isAdmin}
			<button
				type="button"
				class="control-pill control-pill--primary"
				onclick={() => (showSearch = !showSearch)}
			>
				<MagnifyingGlass size={16} weight="bold" />
				{showSearch ? 'Hide search' : 'Add from search'}
			</button>
		{/if}
	{/snippet}

	{#if data.isAdmin && showSearch}
		<div class="surface-round mb-8 p-5">
			<p class="mb-4 text-sm font-medium text-stone-600 dark:text-stone-400">
				Search metadata APIs and add directly to your wishlist or collection.
			</p>
			<MediaSearchPanel category={data.category} context="wishlist" />
		</div>
	{/if}

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		emptyTitle="Wishlist is empty"
		emptyDescription="Save things to buy here. Admins can move items into the collection later."
	/>
</PageShell>
