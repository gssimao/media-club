<script lang="ts">
	import { enhance } from '$app/forms';
	import PageShell from '$lib/components/PageShell.svelte';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { CATEGORY_LABELS, CATEGORY_PATHS } from '$lib/types/media';

	let { data } = $props();

	const categoryPath = $derived(CATEGORY_PATHS[data.category]);
</script>

<svelte:head>
	<title>{data.label} Collections · Media Club</title>
</svelte:head>

<PageShell title="{data.label} Collections">
	{#snippet controls()}
		<NavLink href="/{categoryPath}" variant="accent">Back to {data.label}</NavLink>
	{/snippet}

	{#if data.isAdmin}
		<form
			method="POST"
			action="/admin/albums?/createAlbum"
			class="surface-round mb-8 flex flex-wrap items-end gap-3 p-4"
			use:enhance={({ formData }) => {
				const title = String(formData.get('title') ?? '').trim();
				return async ({ result, update }) => {
					if (result.type === 'failure') {
						toast.error(String(result.data?.message ?? 'Could not create collection.'));
					} else if (result.type === 'error') {
						toast.error('Could not create collection.');
					} else {
						toast.success(`Created collection "${title}".`);
					}
					await update();
				};
			}}
		>
			<input type="hidden" name="category" value={data.category} />
			<label class="min-w-[12rem] flex-1 space-y-1 text-sm">
				<span class="font-bold text-stone-700 dark:text-stone-300">New collection</span>
				<input
					type="text"
					name="title"
					required
					placeholder="e.g. Wes Anderson"
					class="input-round w-full"
				/>
			</label>
			<button type="submit" class="btn-primary px-5 py-2.5 text-sm">Create collection</button>
		</form>
	{/if}

	{#if data.albums.length === 0}
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
			{#each data.albums as album, index (album.id)}
				<div class="anim-rise" style="--rise-delay: {Math.min(index * 40, 400)}ms">
					<AlbumCard {album} displayCoverUrl={data.coverUrls[album.id] ?? null} fluid />
				</div>
			{/each}
		</div>
	{/if}
</PageShell>
