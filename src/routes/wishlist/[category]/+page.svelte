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
				class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400"
			>
				Wishlist
			</div>
			<h1 class="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{data.label}</h1>
		</div>
		<a
			href={ownedHref}
			class="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
		>
			View collection →
		</a>
	</div>

	<div class="flex flex-wrap gap-2 text-sm">
		<a
			href="/wishlist/movies"
			class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors {data.category ===
			'movie'
				? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
				: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'}"
		>
			<Film class="size-4" />
			Movies
		</a>
		<a
			href="/wishlist/music"
			class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors {data.category ===
			'music'
				? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
				: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'}"
		>
			<Disc3 class="size-4" />
			Music
		</a>
		<a
			href="/wishlist/books"
			class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors {data.category ===
			'book'
				? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
				: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'}"
		>
			<BookOpen class="size-4" />
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
