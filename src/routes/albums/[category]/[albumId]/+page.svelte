<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import AlbumSleeve from '$lib/components/AlbumSleeve.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';

	let { data } = $props();

	const categoryPath = $derived(
		data.category === 'movie' ? 'movies' : data.category === 'music' ? 'music' : 'books'
	);
</script>

<svelte:head>
	<title>{data.album.title} · Media Club</title>
</svelte:head>

<PageShell title={data.album.title} description={data.album.description ?? undefined}>
	{#snippet controls()}
		<a
			href="/albums/{data.category}"
			class="pill-nav bg-amber-400/10 text-amber-600 hover:bg-amber-400/20 dark:text-amber-400"
		>
			All {data.label} albums
		</a>
		<a
			href="/{categoryPath}"
			class="pill-nav text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700"
		>
			Back to {data.label}
		</a>

		{#if data.isAdmin}
			<form method="POST" action="/admin/albums?/deleteAlbum">
				<input type="hidden" name="id" value={data.album.id} />
				<button
					type="submit"
					class="pill-nav border border-red-400/80 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
				>
					Delete album
				</button>
			</form>
		{/if}
	{/snippet}

	<div class="mb-8">
		<AlbumSleeve album={data.album} displayCoverUrl={data.displayCoverUrl} />
	</div>

	{#if data.isAdmin}
		<form
			method="POST"
			action="/admin/albums?/updateAlbum"
			class="surface-round mb-8 space-y-3 p-4"
		>
			<input type="hidden" name="id" value={data.album.id} />
			<label class="block space-y-1 text-sm">
				<span class="font-bold text-stone-700 dark:text-stone-300">Title</span>
				<input type="text" name="title" value={data.album.title} required class="input-round w-full" />
			</label>
			<label class="block space-y-1 text-sm">
				<span class="font-bold text-stone-700 dark:text-stone-300">Description</span>
				<input
					type="text"
					name="description"
					value={data.album.description ?? ''}
					class="input-round w-full"
				/>
			</label>
			<label class="block space-y-1 text-sm">
				<span class="font-bold text-stone-700 dark:text-stone-300">Cover URL (optional)</span>
				<input
					type="url"
					name="coverUrl"
					value={data.album.coverUrl ?? ''}
					class="input-round w-full"
					placeholder="Leave blank to use first item cover"
				/>
			</label>
			<button type="submit" class="btn-primary px-5 py-2 text-sm">Save album</button>
		</form>
	{/if}

	<MediaGrid
		items={data.items}
		isAdmin={data.isAdmin}
		albums={[data.album]}
		emptyTitle="This album is empty"
		emptyDescription="Assign items from the {data.label.toLowerCase()} collection using the album dropdown on each card."
	/>
</PageShell>
