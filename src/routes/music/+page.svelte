<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import { Heart } from 'phosphor-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Music · Media Club</title>
</svelte:head>

<PageShell title="Music" description="Vinyl and records in the collection.">
	{#snippet controls()}
		<a
			href="/wishlist/music"
			class="pill-nav bg-amber-400/10 text-amber-600 hover:bg-amber-400/20 dark:text-amber-400"
		>
			<Heart size={16} weight="bold" />
			View wishlist
		</a>
	{/snippet}

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		emptyTitle="No records yet"
		emptyDescription="Search Discogs from the Admin panel to add vinyl to the collection."
	/>
</PageShell>
