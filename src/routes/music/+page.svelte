<script lang="ts">
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import { Heart } from '@lucide/svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Music · Media Club</title>
</svelte:head>

<section class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<div
				class="inline-flex items-center gap-2 text-xs font-black tracking-wider text-amber-600 uppercase dark:text-amber-400"
			>
				Collection
			</div>
			<h1 class="mt-1 text-3xl font-black text-stone-900 uppercase dark:text-amber-50">Music</h1>
			<p class="mt-2 text-sm font-medium text-stone-700 dark:text-stone-300">
				Vinyl and records in the collection.
			</p>
		</div>
		<a
			href="/wishlist/music"
			class="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
		>
			<Heart class="size-4" strokeWidth={2.5} />
			View wishlist
		</a>
	</div>

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		emptyTitle="No records yet"
		emptyDescription="Search Discogs from the Admin panel to add vinyl to the collection."
	/>
</section>
