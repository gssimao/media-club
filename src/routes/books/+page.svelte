<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import { Heart } from 'phosphor-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Books · Media Club</title>
</svelte:head>

<PageShell title="Books">
	{#snippet controls()}
		<a
			href="/wishlist/books"
			class="pill-nav bg-amber-400/10 text-amber-600 hover:bg-amber-400/20 dark:text-amber-400"
		>
			<Heart size={16} weight="bold" />
			View wishlist
		</a>
	{/snippet}

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		emptyTitle="No books yet"
		emptyDescription="Search Open Library from the Admin panel to add books to the collection."
	/>
</PageShell>
