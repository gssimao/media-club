<script lang="ts">
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import { Film, Disc3, BookOpen } from '@lucide/svelte';

	let { data } = $props();

	const ownedHref = $derived(
		data.category === 'movie' ? '/movies' : data.category === 'music' ? '/music' : '/books'
	);
</script>

<svelte:head>
	<title>{data.label} Wishlist · Media Club</title>
</svelte:head>

<section class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<div
				class="inline-flex items-center gap-2 text-xs font-black tracking-wider text-amber-600 uppercase dark:text-amber-400"
			>
				Wishlist
			</div>
			<h1 class="mt-1 text-3xl font-black text-stone-900 uppercase dark:text-amber-50">
				{data.label}
			</h1>
		</div>
		<a
			href={ownedHref}
			class="text-sm font-bold text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
		>
			View collection →
		</a>
	</div>

	<div class="flex flex-wrap gap-2 text-sm">
		<a
			href="/wishlist/movies"
			class="inline-flex items-center gap-1.5 rounded px-3 py-1.5 font-bold uppercase transition-colors {data.category ===
			'movie'
				? 'bg-amber-400 text-stone-900'
				: 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100'}"
		>
			<Film class="size-4" strokeWidth={2.5} />
			Movies
		</a>
		<a
			href="/wishlist/music"
			class="inline-flex items-center gap-1.5 rounded px-3 py-1.5 font-bold uppercase transition-colors {data.category ===
			'music'
				? 'bg-amber-400 text-stone-900'
				: 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100'}"
		>
			<Disc3 class="size-4" strokeWidth={2.5} />
			Music
		</a>
		<a
			href="/wishlist/books"
			class="inline-flex items-center gap-1.5 rounded px-3 py-1.5 font-bold uppercase transition-colors {data.category ===
			'book'
				? 'bg-amber-400 text-stone-900'
				: 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100'}"
		>
			<BookOpen class="size-4" strokeWidth={2.5} />
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
