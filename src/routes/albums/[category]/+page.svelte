<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import AddCollectionTile from '$lib/components/AddCollectionTile.svelte';
	import AddFolderDialog from '$lib/components/AddFolderDialog.svelte';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import { CATEGORY_LABELS, CATEGORY_PATHS } from '$lib/types/media';

	let { data } = $props();
	let showAddDialog = $state(false);

	const categoryPath = $derived(CATEGORY_PATHS[data.category]);
</script>

<svelte:head>
	<title>{data.label} Collections · Media Club</title>
</svelte:head>

<PageShell title="{data.label} Collections">
	{#snippet controls()}
		<NavLink href="/{categoryPath}" variant="accent">Back to {data.label}</NavLink>
	{/snippet}

	{#if data.albums.length === 0 && !data.isAdmin}
		<EmptyState
			title="No collections yet"
			description={data.isAdmin
				? `Create a collection to group your ${CATEGORY_LABELS[data.category].toLowerCase()}.`
				: 'No collections have been published in this category yet.'}
		/>
	{:else}
		<!-- As many sleeve-width columns as fit; sleeves stretch to share the leftover space,
		     so tiles never overlap or run off the edge. -->
		<div
			class="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] sm:gap-x-6"
		>
			{#if data.isAdmin}<AddCollectionTile
					category={data.category}
					onclick={() => (showAddDialog = true)}
				/>{/if}
			{#each data.albums as album, index (album.id)}
				<div class="anim-rise" style="--rise-delay: {Math.min(index * 40, 400)}ms">
					<AlbumCard {album} displayCoverUrl={data.coverUrls[album.id] ?? null} fluid />
				</div>
			{/each}
		</div>
	{/if}
</PageShell>

{#if data.isAdmin}<AddFolderDialog
		category={data.category}
		isOpen={showAddDialog}
		onClose={() => (showAddDialog = false)}
	/>{/if}
