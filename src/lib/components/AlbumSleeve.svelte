<script lang="ts">
	import type { Album } from '$lib/types/media';
	import VinylDisc from './VinylDisc.svelte';

	interface Props {
		album: Album;
		displayCoverUrl?: string | null;
	}

	let { album, displayCoverUrl = null }: Props = $props();

	const cover = $derived(displayCoverUrl ?? album.coverUrl);
</script>

<div class="sleeve-hero group mx-auto w-full max-w-xs">
	<div class="relative">
		<!-- Vinyl slides out of the sleeve on hover -->
		<div class="album-disc" aria-hidden="true">
			<VinylDisc class="size-full drop-shadow-lg" />
		</div>
		<div
			class="absolute top-2 -left-2 h-[calc(100%-0.5rem)] w-4 rounded-l-full bg-[rgb(var(--color-border))] shadow-inner dark:bg-stone-600"
			aria-hidden="true"
		></div>
		<div
			class="relative ml-2 aspect-[3/4] overflow-hidden rounded-[2rem] border-2 border-amber-500/50 bg-[rgb(var(--color-surface))] shadow-xl dark:bg-stone-900"
		>
			{#if cover}
				<img src={cover} alt="{album.title} album cover" class="h-full w-full object-cover" />
			{:else}
				<div
					class="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-[rgb(var(--color-text-secondary))] dark:text-stone-400"
				>
					{album.title}
				</div>
			{/if}
		</div>
	</div>
	{#if album.description}
		<p class="mt-4 text-center text-sm font-medium text-stone-600 dark:text-stone-400">
			{album.description}
		</p>
	{/if}
</div>

<style>
	.album-disc {
		position: absolute;
		top: 50%;
		right: 0.5rem;
		width: 76%;
		aspect-ratio: 1;
		transform: translateY(-50%);
		transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.sleeve-hero:hover .album-disc {
		transform: translateY(-50%) translateX(32%) rotate(40deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.album-disc {
			transition: none;
		}

		.sleeve-hero:hover .album-disc {
			transform: translateY(-50%);
		}
	}

	:global([data-motion='reduced']) .album-disc {
		transition: none;
	}

	:global([data-motion='reduced']) .sleeve-hero:hover .album-disc {
		transform: translateY(-50%);
	}
</style>
