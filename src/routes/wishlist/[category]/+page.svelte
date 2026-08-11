<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import { FilmStrip, VinylRecord, BookOpen } from 'phosphor-svelte';

	let { data } = $props();

	const ownedHref = $derived(
		data.category === 'movie' ? '/movies' : data.category === 'music' ? '/music' : '/books'
	);

	const tabClass = (active: boolean) =>
		`pill-nav ${active ? 'bg-amber-400 text-stone-900' : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700'}`;
</script>

<svelte:head>
	<title>{data.label} Wishlist · Media Club</title>
</svelte:head>

<PageShell title="{data.label} Wishlist">
	{#snippet controls()}
		<a href={ownedHref} class="pill-nav bg-amber-400/10 text-amber-600 dark:text-amber-400">
			View collection →
		</a>

		<div class="flex flex-col items-start gap-2">
			<a href="/wishlist/movies" class={tabClass(data.category === 'movie')}>
				<FilmStrip size={16} weight="bold" />
				Movies
			</a>
			<a href="/wishlist/music" class={tabClass(data.category === 'music')}>
				<VinylRecord size={16} weight="bold" />
				Music
			</a>
			<a href="/wishlist/books" class={tabClass(data.category === 'book')}>
				<BookOpen size={16} weight="bold" />
				Books
			</a>
		</div>
	{/snippet}

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		emptyTitle="Wishlist is empty"
		emptyDescription="Save things to buy here. Admins can move items into the collection later."
	/>
</PageShell>
