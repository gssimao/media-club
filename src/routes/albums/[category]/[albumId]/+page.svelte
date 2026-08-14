<script lang="ts">
	import { enhance } from '$app/forms';
	import PageShell from '$lib/components/PageShell.svelte';
	import AlbumSleeve from '$lib/components/AlbumSleeve.svelte';
	import AlbumRandomPicker from '$lib/components/AlbumRandomPicker.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import { CATEGORY_ACTION_WORDING, CATEGORY_PATHS, type MediaItem } from '$lib/types/media';

	let { data } = $props();

	const categoryPath = $derived(CATEGORY_PATHS[data.category]);
	const wording = $derived(CATEGORY_ACTION_WORDING[data.category]);

	const unwatchedItems = $derived(data.items.filter((item) => !item.albumWatchedAt));
	const watchedItems = $derived(data.items.filter((item) => item.albumWatchedAt));

	let highlightedId = $state<string | null>(null);

	function handlePick(item: MediaItem) {
		highlightedId = item.id;
		requestAnimationFrame(() => {
			document.getElementById(`item-${item.id}`)?.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		});
	}
</script>

<svelte:head>
	<title>{data.album.title} · Media Club</title>
</svelte:head>

<PageShell title={data.album.title} description={data.album.description ?? undefined}>
	{#snippet controls()}
		<NavLink href="/albums/{data.category}" variant="accent">All {data.label} albums</NavLink>
		<NavLink href="/{categoryPath}">Back to {data.label}</NavLink>

		<AlbumRandomPicker
			{unwatchedItems}
			category={data.category}
			isAdmin={data.isAdmin}
			onPick={handlePick}
		/>

		{#if data.isAdmin}
			<form
				method="POST"
				action="/admin/albums?/deleteAlbum"
				use:enhance={({ cancel }) => {
					if (!confirm(`Delete the album "${data.album.title}"? Items stay in the catalog.`)) {
						cancel();
					}
				}}
			>
				<input type="hidden" name="id" value={data.album.id} />
				<button
					type="submit"
					class="pill-nav border border-red-400/80 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
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
			use:enhance
		>
			<input type="hidden" name="id" value={data.album.id} />
			<label class="block space-y-1 text-sm">
				<span class="font-bold text-stone-700 dark:text-stone-300">Title</span>
				<input
					type="text"
					name="title"
					value={data.album.title}
					required
					class="input-round w-full"
				/>
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
		items={unwatchedItems}
		isAdmin={data.isAdmin}
		albums={[data.album]}
		sectionTitle="To {wording.verb}"
		{highlightedId}
		showAlbumWatchedToggle={data.isAdmin}
		emptyTitle="Nothing left to {wording.verb}"
		emptyDescription={watchedItems.length > 0
			? `Every item in this album has been marked ${wording.done}. Use Mark ${wording.notDone} on a card to add it back to the pool.`
			: `Assign items from the ${data.label.toLowerCase()} collection using the album dropdown on each card.`}
	/>

	{#if watchedItems.length > 0}
		<div class="mt-12">
			<MediaGrid
				items={watchedItems}
				isAdmin={data.isAdmin}
				albums={[data.album]}
				sectionTitle="Already {wording.done}"
				{highlightedId}
				showAlbumWatchedToggle={data.isAdmin}
				showSearch={false}
				emptyTitle=""
				emptyDescription=""
			/>
		</div>
	{/if}
</PageShell>
