<script lang="ts">
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

<section class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<div
				class="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-black tracking-wider text-amber-700 uppercase dark:text-amber-400"
			>
				Wishlist
			</div>
			<h1 class="mt-3 text-3xl font-black text-stone-900 uppercase dark:text-amber-50">
				{data.label}
			</h1>
		</div>
		<a href={ownedHref} class="pill-nav bg-amber-400/10 text-amber-600 dark:text-amber-400">
			View collection →
		</a>
	</div>

	<div class="flex flex-wrap gap-2 text-sm">
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

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		emptyTitle="Wishlist is empty"
		emptyDescription="Save things to buy here. Admins can move items into the collection later."
	/>
</section>
