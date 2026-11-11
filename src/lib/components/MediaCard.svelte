<script lang="ts">
	import CoverImage from './CoverImage.svelte';
	import MediaCardAdminPanel from './MediaCardAdminPanel.svelte';
	import MediaCardAdminToolbar from './MediaCardAdminToolbar.svelte';
	import MediaCoverTools from './MediaCoverTools.svelte';
	import { bindCoverReveal } from '$lib/utils/cover-reveal';
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
		class="media-disc relative aspect-square w-full max-w-[13rem] overflow-hidden rounded-full border-2 bg-[rgb(var(--color-surface-raised))] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md sm:max-w-[15rem] {highlighted
			? 'border-amber-400 ring-4 ring-amber-400/60 ring-offset-2 ring-offset-[rgb(var(--color-bg))]'
			: ''} {item.listType === 'wishlist'
			? 'border-dashed border-amber-500 dark:border-amber-500'
			: highlighted
				? ''
				: 'border-amber-500/45 dark:border-amber-500/35'}"
		role="group"
		aria-label="Details for {item.title}"
		{@attach reveal}
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

		<MediaCoverTools
			{item}
			{isAdmin}
			{albums}
			{showAlbumWatchedToggle}
			{showCollectionLink}
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
