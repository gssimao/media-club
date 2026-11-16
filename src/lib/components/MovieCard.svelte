<script lang="ts">
	import PosterCover from './PosterCover.svelte';
	import MediaCardAdminPanel from './MediaCardAdminPanel.svelte';
	import MediaCardAdminToolbar from './MediaCardAdminToolbar.svelte';
	import MediaCoverTools from './MediaCoverTools.svelte';
	import { getDisplayTags } from '$lib/utils/format-tags';
	import type { Album, MediaItem } from '$lib/types/media';

	interface Props {
		item: MediaItem;
		isAdmin: boolean;
		albums?: Album[];
		highlighted?: boolean;
		showAlbumWatchedToggle?: boolean;
		showCollectionLink?: boolean;
		genreCatalogItems?: MediaItem[];
	}

	let {
		item,
		isAdmin,
		albums = [],
		highlighted = false,
		showAlbumWatchedToggle = false,
		showCollectionLink = false,
		genreCatalogItems = []
	}: Props = $props();

	const label = $derived(item.year ? `${item.title} (${item.year})` : item.title);
	const displayTags = $derived(getDisplayTags(item));

	const hasDVD = $derived(displayTags.some((tag) => tag === 'DVD'));
	const hasBluray = $derived(displayTags.some((tag) => tag === 'Blu-ray'));
	const has4K = $derived(displayTags.some((tag) => tag === '4K'));
	const hasStreaming = $derived(displayTags.some((tag) => tag === 'Streaming'));
	const hasDigital = $derived(displayTags.some((tag) => tag === 'Digital'));

	// Highest-priority format strip: movies (4K > Blu-ray > DVD), shows (Streaming > Digital > Blu-ray > DVD)
	const topFormat = $derived.by(() => {
		if (item.category === 'show') {
			if (hasStreaming) return 'Streaming';
			if (hasDigital) return 'Digital';
			if (hasBluray) return 'Blu-ray';
			if (hasDVD) return 'DVD';
			return null;
		}
		if (has4K) return '4K';
		if (hasBluray) return 'Blu-ray';
		if (hasDVD) return 'DVD';
		return null;
	});

	let adminPanel: MediaCardAdminPanel | undefined = $state();
	let showAdminMenu = $state(false);
	let cardHovered = $state(false);
</script>

<article
	id="item-{item.id}"
	class="group mx-auto flex h-full w-full max-w-[15rem] scroll-mt-32 flex-col items-center transition-[transform,filter] duration-500 {highlighted
		? 'scale-105'
		: ''} {showAdminMenu ? 'relative z-20' : ''}"
	onmouseenter={() => (cardHovered = true)}
	onmouseleave={() => (cardHovered = false)}
>
	<div class="mb-1 flex min-h-7 w-full items-center justify-between px-0.5">
		{#if item.year}
			<span
				class="text-xs font-medium tracking-normal text-[rgb(var(--color-text-tertiary))] tabular-nums"
			>
				{item.year}
			</span>
		{:else}
			<span aria-hidden="true"></span>
		{/if}

		{#if isAdmin}
			<MediaCardAdminToolbar
				{item}
				bind:open={showAdminMenu}
				onAction={(action) => adminPanel?.run(action)}
			/>
		{/if}
	</div>

	<PosterCover
		title={label}
		coverUrl={item.coverUrl}
		hovered={cardHovered}
		{highlighted}
		wishlist={item.listType === 'wishlist'}
		format={topFormat}
	>
		{#snippet children(toolsOpen)}
			<MediaCoverTools
				{item}
				{isAdmin}
				{albums}
				{showAlbumWatchedToggle}
				{showCollectionLink}
				{genreCatalogItems}
				open={toolsOpen}
			/>
		{/snippet}
	</PosterCover>

	<div class="flex min-h-0 w-full flex-1 flex-col">
		<div class="mt-2.5 w-full shrink-0 px-1 text-center">
			<h2
				class="line-clamp-2 min-h-[2.5rem] text-sm leading-snug font-medium text-stone-900 dark:text-amber-50"
			>
				{item.title}
			</h2>
			<p
				class="mt-0.5 line-clamp-1 min-h-[1.125rem] text-[11px] font-medium text-stone-600 dark:text-stone-400"
			>
				{item.subtitle ?? ''}
			</p>
		</div>
	</div>

	{#if isAdmin}
		<MediaCardAdminPanel bind:this={adminPanel} {item} />
	{/if}
</article>
