<script lang="ts">
	import { enhance } from '$app/forms';
	import CoverImage from './CoverImage.svelte';
	import MediaCardAdminPanel from './MediaCardAdminPanel.svelte';
	import MediaCardAdminToolbar from './MediaCardAdminToolbar.svelte';
	import {
		FORMAT_TAG_PRESETS,
		getDisplayNotes,
		getDisplayTags,
		toggleTag
	} from '$lib/utils/format-tags';
	import type { Album, MediaItem } from '$lib/types/media';

	interface Props {
		item: MediaItem;
		isAdmin: boolean;
		albums?: Album[];
		highlighted?: boolean;
		showAlbumWatchedToggle?: boolean;
		showCollectionLink?: boolean;
	}

	let {
		item,
		isAdmin,
		albums = [],
		highlighted = false,
		showAlbumWatchedToggle = false,
		showCollectionLink = false
	}: Props = $props();

	const label = $derived(item.year ? `${item.title} (${item.year})` : item.title);
	const displayTags = $derived(getDisplayTags(item));
	const displayNotes = $derived(getDisplayNotes(item));
	const presetTags = $derived(FORMAT_TAG_PRESETS[item.category]);
	const collection = $derived(
		item.albumId ? (albums.find((album) => album.id === item.albumId) ?? null) : null
	);

	let deleteForm: HTMLFormElement | undefined = $state();
	let showDeleteConfirm = $state(false);
	let showAdminMenu = $state(false);
	let cardHovered = $state(false);

	function toggleAdminMenu() {
		showAdminMenu = !showAdminMenu;
	}
</script>

<article
	id="item-{item.id}"
	class="group mx-auto flex h-full w-full max-w-[15rem] scroll-mt-32 flex-col items-center transition-[transform,filter] duration-500 {highlighted
		? 'scale-105'
		: ''}"
	onmouseenter={() => (cardHovered = true)}
	onmouseleave={() => (cardHovered = false)}
>
	<div class="mb-1 flex min-h-7 w-full items-center justify-between px-0.5">
		{#if item.year}
			<span
				class="text-xs font-black tracking-widest text-amber-700 tabular-nums dark:text-amber-400"
			>
				{item.year}
			</span>
		{:else}
			<span aria-hidden="true"></span>
		{/if}

		{#if isAdmin}
			<MediaCardAdminToolbar {item} {showAdminMenu} onToggleMenu={toggleAdminMenu} />
		{/if}
	</div>

	<div
		class="media-disc relative aspect-square w-full max-w-[13rem] overflow-hidden rounded-full border-2 bg-[rgb(var(--color-surface-raised))] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md sm:max-w-[15rem] {highlighted
			? 'border-amber-400 ring-4 ring-amber-400/60 ring-offset-2 ring-offset-[rgb(var(--color-bg))]'
			: ''} {item.listType === 'wishlist'
			? 'border-dashed border-amber-500 dark:border-amber-500'
			: highlighted
				? ''
				: 'border-amber-500/45 dark:border-amber-500/35'}"
	>
		{#if item.listType === 'wishlist'}
			<div
				class="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-amber-400 px-2.5 py-0.5 text-[9px] font-black tracking-wide text-stone-900 uppercase"
			>
				Wishlist
			</div>
		{/if}

		<svg
			class="pointer-events-none absolute inset-0 size-full text-amber-500 dark:text-amber-400"
			viewBox="0 0 100 100"
			aria-hidden="true"
		>
			<g class="disc-grooves">
				{#each [47, 44, 41] as radius (radius)}
					<circle
						cx="50"
						cy="50"
						r={radius}
						fill="none"
						stroke="currentColor"
						stroke-width="0.5"
						opacity="0.35"
					/>
				{/each}
				{#each Array.from({ length: 12 }, (_, i) => i * 30) as angle (angle)}
					<line
						x1="50"
						y1="2.5"
						x2="50"
						y2="7"
						stroke="currentColor"
						stroke-width="1"
						opacity="0.45"
						transform="rotate({angle} 50 50)"
					/>
				{/each}
			</g>
		</svg>

		<div class="absolute inset-0 flex items-center justify-center">
			<div
				class="aspect-[2/3] w-[58%] overflow-hidden rounded-[1.5rem] bg-[rgb(var(--color-bg))] dark:bg-stone-900"
			>
				{#if item.coverUrl}
					<CoverImage
						src={item.coverUrl}
						alt="{label} cover"
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						hovered={cardHovered}
					/>
				{:else}
					<div
						class="flex h-full items-center justify-center px-2 text-center text-[10px] font-semibold text-[rgb(var(--color-text-tertiary))] dark:text-stone-500"
					>
						No cover
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex min-h-0 w-full flex-1 flex-col">
		<div class="mt-2.5 w-full shrink-0 px-1 text-center">
			<h2
				class="line-clamp-2 min-h-[2.5rem] text-xs leading-snug font-bold text-stone-900 dark:text-amber-50"
			>
				{item.title}
			</h2>
			<p
				class="mt-0.5 line-clamp-1 min-h-[1.125rem] text-[11px] font-medium text-stone-600 dark:text-stone-400"
			>
				{item.subtitle ?? ''}
			</p>
			{#if showCollectionLink}
				<div class="mt-1 flex min-h-[1.375rem] items-center justify-center">
					{#if collection}
						<a
							href="/albums/{collection.category}/{collection.id}"
							class="inline-block max-w-full truncate rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-700 uppercase hover:bg-amber-400/25 dark:text-amber-400"
						>
							In {collection.title}
						</a>
					{/if}
				</div>
			{/if}
		</div>

		{#if isAdmin}
			<div class="mt-2 flex min-h-[1.375rem] w-full shrink-0 flex-wrap justify-center gap-1 px-1">
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
							class="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase transition-colors {active
								? 'bg-amber-400 text-stone-900'
								: 'border border-dashed border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400'}"
						>
							{tag}
						</button>
					</form>
				{/each}
			</div>
		{:else if displayTags.length > 0}
			<div class="mt-2 flex min-h-[1.375rem] w-full shrink-0 flex-wrap justify-center gap-1 px-1">
				{#each displayTags as tag (tag)}
					<span
						class="rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold tracking-wide text-stone-900 uppercase"
					>
						{tag}
					</span>
				{/each}
			</div>
		{/if}

		<div class="min-h-0 flex-1" aria-hidden="true"></div>

		<div class="w-full shrink-0 {isAdmin ? 'mt-3' : ''}">
			{#if isAdmin}
				<MediaCardAdminPanel
					{item}
					{albums}
					{showAlbumWatchedToggle}
					{showAdminMenu}
					onCloseMenu={() => (showAdminMenu = false)}
					onDeleteConfirm={() => (showDeleteConfirm = true)}
					{showDeleteConfirm}
					onCancelDelete={() => (showDeleteConfirm = false)}
					onConfirmDelete={() => {
						showDeleteConfirm = false;
						deleteForm?.requestSubmit();
					}}
					bind:deleteForm
				/>
			{:else}
				<div class="mt-2 min-h-[3.25rem] w-full">
					{#if displayNotes}
						<p
							class="line-clamp-2 w-full rounded-[2rem] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 text-center text-[10px] text-[rgb(var(--color-text-secondary))]"
						>
							{displayNotes}
						</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</article>

<style>
	@keyframes disc-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.disc-grooves {
		transform-box: fill-box;
		transform-origin: center;
	}

	article:hover .media-disc .disc-grooves {
		animation: disc-spin 5s linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		article:hover .media-disc .disc-grooves {
			animation: none;
		}
	}

	:global([data-motion='reduced']) article:hover .media-disc .disc-grooves {
		animation: none;
	}
</style>
