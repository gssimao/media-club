<script lang="ts">
	import CoverImage from './CoverImage.svelte';
	import MediaCardAdminPanel from './MediaCardAdminPanel.svelte';
	import MediaCardAdminToolbar from './MediaCardAdminToolbar.svelte';
	import MediaCoverTools from './MediaCoverTools.svelte';
	import { bindCoverReveal } from '$lib/utils/cover-reveal';
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
	let coverEl = $state<HTMLDivElement | undefined>();
	let toolsHover = $state(false);
	let toolsPinned = $state(false);
	let toolsKeyboard = $state(false);
	const toolsOpen = $derived(toolsHover || toolsPinned || toolsKeyboard);
	const reveal = bindCoverReveal({
		setHover: (hovering) => (toolsHover = hovering),
		togglePin: () => (toolsPinned = !toolsPinned),
		setKeyboard: (active) => (toolsKeyboard = active)
	});

	// Touch screens have no hover, so a tap pins the tools until a tap outside.
	$effect(() => {
		if (!toolsPinned) return;

		function onPointerDown(event: PointerEvent) {
			if (coverEl && event.target instanceof Node && !coverEl.contains(event.target)) {
				toolsPinned = false;
			}
		}

		document.addEventListener('pointerdown', onPointerDown, true);
		return () => document.removeEventListener('pointerdown', onPointerDown, true);
	});
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
				class="text-xs font-black tracking-widest text-amber-700 tabular-nums dark:text-amber-400"
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

	<div
		bind:this={coverEl}
		class="bluray-case relative aspect-[2/3] w-full max-w-[13rem] overflow-hidden rounded-sm bg-[rgb(var(--color-surface-raised))] shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl sm:max-w-[15rem] {highlighted
			? 'ring-4 ring-amber-400/60 ring-offset-2 ring-offset-[rgb(var(--color-bg))]'
			: ''} {item.listType === 'wishlist'
			? 'border-2 border-dashed border-amber-500 dark:border-amber-500'
			: ''}"
		role="group"
		aria-label="Details for {item.title}"
		{@attach reveal}
	>
		{#if item.listType === 'wishlist'}
			<div
				class="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-amber-400 px-2.5 py-0.5 text-[9px] font-black tracking-wide text-stone-900 uppercase shadow-md"
			>
				Wishlist
			</div>
		{/if}

		<!-- Format strip at the top (highest quality only) -->
		{#if topFormat}
			<div class="absolute top-0 right-0 left-0 z-10">
				{#if topFormat === '4K'}
					<div
						class="bg-gradient-to-r from-black to-stone-900 py-1 text-center text-[8px] font-black tracking-wider text-white uppercase shadow-sm"
					>
						4K Ultra HD
					</div>
				{:else if topFormat === 'Streaming'}
					<div
						class="bg-gradient-to-r from-violet-600 to-violet-500 py-1 text-center text-[8px] font-black tracking-wider text-white uppercase shadow-sm"
					>
						Streaming
					</div>
				{:else if topFormat === 'Digital'}
					<div
						class="bg-gradient-to-r from-stone-700 to-stone-600 py-1 text-center text-[8px] font-black tracking-wider text-white uppercase shadow-sm"
					>
						Digital
					</div>
				{:else if topFormat === 'Blu-ray'}
					<div
						class="bg-gradient-to-r from-blue-600 to-blue-500 py-1 text-center text-[8px] font-black tracking-wider text-white uppercase shadow-sm"
					>
						Blu-ray
					</div>
				{:else if topFormat === 'DVD'}
					<div
						class="bg-gradient-to-r from-red-600 to-red-500 py-1 text-center text-[8px] font-black tracking-wider text-white uppercase shadow-sm"
					>
						DVD
					</div>
				{/if}
			</div>
		{/if}

		<!-- Main cover image -->
		<div class="relative h-full w-full overflow-hidden bg-stone-900">
			{#if item.coverUrl}
				<CoverImage
					src={item.coverUrl}
					alt="{label} cover"
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					hovered={cardHovered}
				/>
			{:else}
				<div
					class="flex h-full items-center justify-center px-3 text-center text-xs font-semibold text-stone-500"
				>
					No cover
				</div>
			{/if}
		</div>

		<!-- Blu-ray case spine effect -->
		<div
			class="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-white/20 via-transparent to-white/10"
			aria-hidden="true"
		></div>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-black/30 via-transparent to-black/20"
			aria-hidden="true"
		></div>

		<MediaCoverTools
			{item}
			{isAdmin}
			{albums}
			{showAlbumWatchedToggle}
			{showCollectionLink}
			{genreCatalogItems}
			open={toolsOpen}
		/>
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
		</div>
	</div>

	{#if isAdmin}
		<MediaCardAdminPanel bind:this={adminPanel} {item} />
	{/if}
</article>

<style>
	.bluray-case {
		/* Simulate the plastic case look with subtle gradients */
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.1),
			0 4px 8px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.group:hover .bluray-case {
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.15),
			0 8px 16px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}
</style>
