<script lang="ts">
	import type { Album } from '$lib/types/media';
	import { CATEGORY_LABELS } from '$lib/types/media';
	import VinylDisc from './VinylDisc.svelte';

	interface Props {
		album: Album;
		displayCoverUrl?: string | null;
		href?: string;
	}

	let { album, displayCoverUrl = null, href }: Props = $props();

	const link = $derived(href ?? `/albums/${album.category}/${album.id}`);
</script>

<a href={link} class="group flex w-[8.5rem] shrink-0 flex-col sm:w-[9.5rem]">
	<div class="relative">
		<!-- Vinyl slides out of the sleeve on hover -->
		<div class="album-disc" aria-hidden="true">
			<VinylDisc class="size-full" />
		</div>
		<div
			class="absolute top-1 -left-1 h-[calc(100%-0.25rem)] w-3 rounded-l-full bg-[rgb(var(--color-border)/0.9)] shadow-inner dark:bg-stone-600/60"
			aria-hidden="true"
		></div>
		<div
			class="relative ml-1 aspect-[3/4] overflow-hidden rounded-[1.5rem] border-2 border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg dark:border-stone-600 dark:bg-stone-900"
		>
			{#if displayCoverUrl ?? album.coverUrl}
				<img
					src={displayCoverUrl ?? album.coverUrl}
					alt="{album.title} album cover"
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading="lazy"
				/>
			{:else}
				<div
					class="flex h-full flex-col items-center justify-center gap-1 px-3 text-center text-[10px] font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase dark:text-stone-400"
				>
					<span>{CATEGORY_LABELS[album.category]}</span>
					<span class="text-[9px] font-medium normal-case">Album</span>
				</div>
			{/if}
		</div>
	</div>
	<div class="mt-2.5 px-0.5">
		<h3 class="line-clamp-2 text-xs font-bold text-stone-900 dark:text-amber-50">
			{album.title}
		</h3>
		<p
			class="mt-0.5 text-[10px] font-semibold text-[rgb(var(--color-text-tertiary))] dark:text-stone-400"
		>
			{album.itemCount === 1 ? '1 item' : `${album.itemCount} items`}
		</p>
	</div>
</a>

<style>
	.album-disc {
		position: absolute;
		top: 50%;
		right: 0.35rem;
		width: 72%;
		aspect-ratio: 1;
		transform: translateY(-50%);
		transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
	}

	a:hover .album-disc {
		transform: translateY(-50%) translateX(24%) rotate(28deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.album-disc {
			transition: none;
		}

		a:hover .album-disc {
			transform: translateY(-50%);
		}
	}

	:global([data-motion='reduced']) .album-disc {
		transition: none;
	}

	:global([data-motion='reduced']) a:hover .album-disc {
		transform: translateY(-50%);
	}
</style>
