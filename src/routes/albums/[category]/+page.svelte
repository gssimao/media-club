<script lang="ts">
	import { enhance } from '$app/forms';
	import PageShell from '$lib/components/PageShell.svelte';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import { CATEGORY_LABELS, CATEGORY_PATHS } from '$lib/types/media';

	let { data } = $props();

	const categoryPath = $derived(CATEGORY_PATHS[data.category]);
</script>

<svelte:head>
	<title>{data.label} Albums · Media Club</title>
</svelte:head>

<PageShell title="{data.label} Albums">
	{#snippet controls()}
		<NavLink href="/{categoryPath}" variant="accent">Back to {data.label}</NavLink>
	{/snippet}

	{#if data.isAdmin}
		<form
			method="POST"
			action="/admin/albums?/createAlbum"
			class="surface-round mb-8 flex flex-wrap items-end gap-3 p-4"
			use:enhance
		>
			<input type="hidden" name="category" value={data.category} />
			<label class="min-w-[12rem] flex-1 space-y-1 text-sm">
				<span class="font-bold text-stone-700 dark:text-stone-300">New album</span>
				<input
					type="text"
					name="title"
					required
					placeholder="e.g. Wes Anderson"
					class="input-round w-full"
				/>
			</label>
			<button type="submit" class="btn-primary px-5 py-2.5 text-sm">Create album</button>
		</form>
	{/if}

	{#if data.albums.length === 0}
		<EmptyState
			title="No albums yet"
			description={data.isAdmin
				? `Create an album to group your ${CATEGORY_LABELS[data.category].toLowerCase()} collection.`
				: 'No albums have been published in this category yet.'}
		/>
	{:else}
		<div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each data.albums as album, index (album.id)}
				<div class="anim-rise" style="--rise-delay: {Math.min(index * 40, 400)}ms">
					<AlbumCard {album} displayCoverUrl={data.coverUrls[album.id] ?? null} />
				</div>
			{/each}
		</div>
	{/if}
</PageShell>
