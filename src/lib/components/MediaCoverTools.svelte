<script lang="ts">
	import { enhance } from '$app/forms';
	import AssignAlbumControl from './AssignAlbumControl.svelte';
	import GenreEditor from './GenreEditor.svelte';
	import {
		FORMAT_TAG_PRESETS,
		getDisplayNotes,
		getDisplayTags,
		toggleTag
	} from '$lib/utils/format-tags';
	import { getDisplayGenres } from '$lib/utils/movie-genres';
	import { CATEGORY_ACTION_WORDING, type Album, type MediaItem } from '$lib/types/media';
	import { Eye, EyeSlash } from 'phosphor-svelte';

	interface Props {
		item: MediaItem;
		isAdmin: boolean;
		albums?: Album[];
		showAlbumWatchedToggle?: boolean;
		showCollectionLink?: boolean;
		genreCatalogItems?: { metadata: Record<string, unknown> | null }[];
		/** Hover, tap, or keyboard focus is holding the tools open. */
		open: boolean;
	}

	let {
		item,
		isAdmin,
		albums = [],
		showAlbumWatchedToggle = false,
		showCollectionLink = false,
		genreCatalogItems = [],
		open
	}: Props = $props();

	const displayTags = $derived(getDisplayTags(item));
	const displayNotes = $derived(getDisplayNotes(item));
	const presetTags = $derived(FORMAT_TAG_PRESETS[item.category]);
	const genres = $derived(
		item.category === 'movie' || item.category === 'show' ? getDisplayGenres(item) : []
	);
	const collection = $derived(
		item.albumId ? (albums.find((album) => album.id === item.albumId) ?? null) : null
	);
	const wording = $derived(CATEGORY_ACTION_WORDING[item.category]);

	const showGenres = $derived(item.category === 'movie' || item.category === 'show');
	const showCollectionSelect = $derived(isAdmin && item.listType === 'owned' && albums.length > 0);

	const hasContent = $derived(
		isAdmin ||
			displayTags.length > 0 ||
			genres.length > 0 ||
			Boolean(displayNotes) ||
			showCollectionSelect ||
			(showCollectionLink && collection !== null) ||
			(showAlbumWatchedToggle && item.albumId !== null)
	);
</script>

{#if hasContent}
	<!-- Sits on the artwork. Hidden until the cover is hovered, tapped, or focused,
	     so the shelf stays a shelf until someone wants to change something. -->
	<div class="cover-tools {open ? 'is-open' : ''}" data-open={open ? 'true' : 'false'}>
		{#if isAdmin}
			<div class="flex flex-wrap justify-center gap-1">
				{#each presetTags as tag (tag)}
					{@const active = displayTags.includes(tag)}
					<form
						method="POST"
						action="/admin/items?/updateTags"
						use:enhance={() => {
							return async ({ update }) => {
								await update({ reset: false });
							};
						}}
					>
						<input type="hidden" name="id" value={item.id} />
						<input type="hidden" name="tags" value={JSON.stringify(toggleTag(displayTags, tag))} />
						<button
							type="submit"
							class="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase transition-colors {active
								? 'bg-amber-400 text-stone-900'
								: 'border border-dashed border-white/40 text-white/80 hover:border-amber-400 hover:text-amber-300'}"
						>
							{tag}
						</button>
					</form>
				{/each}
			</div>
		{:else if displayTags.length > 0}
			<div class="flex flex-wrap justify-center gap-1">
				{#each displayTags as tag (tag)}
					<span
						class="rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-stone-900 uppercase"
					>
						{tag}
					</span>
				{/each}
			</div>
		{/if}

		{#if showGenres}
			<div class="cover-tools__genres">
				<GenreEditor
					{item}
					action="/admin/items?/updateGenres"
					{isAdmin}
					category={item.category === 'show' ? 'show' : 'movie'}
					catalogItems={genreCatalogItems}
				/>
			</div>
		{/if}

		{#if showCollectionSelect}
			<div class="w-full">
				<AssignAlbumControl itemId={item.id} albumId={item.albumId} {albums} />
			</div>
		{:else if showCollectionLink && collection}
			<a
				href="/albums/{collection.category}/{collection.id}"
				class="inline-block max-w-full truncate rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-200 uppercase hover:bg-amber-400/30"
			>
				In {collection.title}
			</a>
		{/if}

		{#if showAlbumWatchedToggle && item.albumId}
			<form method="POST" action="/admin/items?/toggleAlbumWatched" use:enhance>
				<input type="hidden" name="id" value={item.id} />
				<input type="hidden" name="watched" value={item.albumWatchedAt ? 'false' : 'true'} />
				<button
					type="submit"
					class="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold tracking-wide text-white uppercase hover:bg-white/25"
				>
					{#if item.albumWatchedAt}
						<EyeSlash size={12} weight="bold" />
						Mark {wording.notDone}
					{:else}
						<Eye size={12} weight="bold" />
						Mark {wording.done}
					{/if}
				</button>
			</form>
		{/if}

		{#if displayNotes}
			<p class="line-clamp-3 text-[10px] leading-snug font-medium text-white/80">
				{displayNotes}
			</p>
		{/if}
	</div>
{/if}

<style>
	.cover-tools {
		position: absolute;
		inset: 0;
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		overflow-y: auto;
		padding: 0.75rem;
		border-radius: inherit;
		background: rgb(12 10 9 / 0.78);
		text-align: center;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.18s ease;
	}

	.cover-tools.is-open {
		opacity: 1;
		pointer-events: auto;
	}

	/* The genre edit button is styled for the page background. Lighten it for the scrim. */
	.cover-tools__genres :global(button) {
		border-color: rgb(255 255 255 / 0.4);
		background: transparent;
		color: white;
	}

	@media (prefers-reduced-motion: reduce) {
		.cover-tools {
			transition: none;
		}
	}
</style>
