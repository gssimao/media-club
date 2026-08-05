<script lang="ts">
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import { Heart } from '@lucide/svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Books · Media Club</title>
</svelte:head>

<section class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<div
				class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400"
			>
				Collection
			</div>
			<h1 class="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Books</h1>
		</div>
		<a
			href="/wishlist/books"
			class="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
		>
			<Heart class="size-4" />
			View wishlist
		</a>
	</div>

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		emptyTitle="No books yet"
		emptyDescription="Search Open Library from the Admin panel to add books to the collection."
	/>
</section>
