<script lang="ts">
	import MediaGrid from '$lib/components/MediaGrid.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Movies · Media Club</title>
</svelte:head>

<section class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="text-sm text-indigo-300">Collection</p>
			<h1 class="text-3xl font-semibold">Movies</h1>
		</div>
		<a href="/wishlist/movies" class="text-sm text-slate-400 hover:text-white">View wishlist →</a>
	</div>

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		emptyTitle="No movies yet"
		emptyDescription="When you're logged in as admin, add movies from the Admin panel."
	/>
</section>
