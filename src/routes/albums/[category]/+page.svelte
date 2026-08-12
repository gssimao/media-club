<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import { CATEGORY_LABELS } from '$lib/types/media';

	let { data } = $props();

	const categoryPath = $derived(
		data.category === 'movie' ? 'movies' : data.category === 'music' ? 'music' : 'books'
	);
</script>

<svelte:head>
	<title>{data.label} Albums · Media Club</title>
</svelte:head>

<PageShell title="{data.label} Albums">
	{#snippet controls()}
		<a
			href="/{categoryPath}"
			class="pill-nav bg-amber-400/10 text-amber-600 hover:bg-amber-400/20 dark:text-amber-400"
		>
			Back to {data.label}
		</a>
	{/snippet}

	{#if data.isAdmin}
		<form
			method="POST"
			action="/admin/albums?/createAlbum"
			class="surface-round mb-8 flex flex-wrap items-end gap-3 p-4"
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
		<div class="surface-round border-dashed px-6 py-16 text-center">
			<h2 class="text-lg font-black text-stone-900 uppercase dark:text-white">No albums yet</h2>
			<p class="mt-2 text-sm font-medium text-stone-600 dark:text-stone-400">
				{#if data.isAdmin}
					Create an album to group your {CATEGORY_LABELS[data.category].toLowerCase()} collection.
				{:else}
					No albums have been published in this category yet.
				{/if}
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each data.albums as album (album.id)}
				<AlbumCard album={album} displayCoverUrl={data.coverUrls[album.id] ?? null} />
			{/each}
		</div>
	{/if}
</PageShell>
