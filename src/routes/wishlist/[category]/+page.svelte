<script lang="ts">
	import MediaGrid from '$lib/components/MediaGrid.svelte';

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
			<p class="text-sm text-indigo-300">Wishlist</p>
			<h1 class="text-3xl font-semibold">{data.label}</h1>
		</div>
		<a href={ownedHref} class="text-sm text-slate-400 hover:text-white">View collection →</a>
	</div>

	<div class="flex flex-wrap gap-2 text-sm">
		<a
			href="/wishlist/movies"
			class="rounded-lg px-3 py-1.5 {data.category === 'movie'
				? 'bg-indigo-500/20 text-indigo-200'
				: 'text-slate-400 hover:text-white'}">Movies</a
		>
		<a
			href="/wishlist/music"
			class="rounded-lg px-3 py-1.5 {data.category === 'music'
				? 'bg-indigo-500/20 text-indigo-200'
				: 'text-slate-400 hover:text-white'}">Music</a
		>
		<a
			href="/wishlist/books"
			class="rounded-lg px-3 py-1.5 {data.category === 'book'
				? 'bg-indigo-500/20 text-indigo-200'
				: 'text-slate-400 hover:text-white'}">Books</a
		>
	</div>

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		emptyTitle="Wishlist is empty"
		emptyDescription="Save things you want to buy here. Admins can move items to your collection later."
	/>
</section>
