<script lang="ts">
	import type { Album } from '$lib/types/media';
	import { getAlbumColorPreset } from '$lib/theme/album-colors';
	import { cn } from '$lib/utils/cn';
	import AlbumSleevePattern from './AlbumSleevePattern.svelte';
	import VinylDisc from './VinylDisc.svelte';

	interface Props {
		album: Album;
		displayCoverUrl?: string | null;
	}

	let { album, displayCoverUrl = null }: Props = $props();

	const cover = $derived(displayCoverUrl ?? album.coverUrl);
	const colorPreset = $derived(getAlbumColorPreset(album.accentColor));
</script>

<div class="sleeve-hero group mx-auto w-full max-w-xs">
	<div class="relative">
		<div class="album-disc" aria-hidden="true">
			<VinylDisc class="size-full drop-shadow-lg" />
		</div>

		<div class="sleeve-assembly">
			<div class="sleeve-spine" aria-hidden="true"></div>
			<div
				class={cn(
					'sleeve-front aspect-[3/4] overflow-hidden rounded-[2rem] border-2 shadow-xl',
					colorPreset.border,
					cover ? 'bg-[rgb(var(--color-surface))] dark:bg-stone-900' : colorPreset.background
				)}
			>
				{#if cover}
					<img
						src={cover}
						alt="{album.title} collection cover"
						class="h-full w-full object-cover"
					/>
				{:else}
					<AlbumSleevePattern seed={album.id} accentColor={album.accentColor} />
					<div class="relative z-[1] flex h-full items-center justify-center p-6">
						<VinylDisc class="size-[58%] drop-shadow-md" />
					</div>
				{/if}
			</div>
		</div>
	</div>
	{#if album.description}
		<p class="mt-4 text-center text-sm font-medium text-stone-600 dark:text-stone-400">
			{album.description}
		</p>
	{/if}
</div>

<style>
	.sleeve-assembly {
		position: relative;
		width: 100%;
		--sleeve-peek: 14px;
		--sleeve-underlap: 35px;
	}

	.sleeve-spine {
		position: absolute;
		top: 0.5rem;
		bottom: 0.25rem;
		left: 0;
		z-index: 0;
		width: calc(var(--sleeve-peek) + var(--sleeve-underlap));
		border-radius: 2rem 0 0 2rem;
		background: rgb(var(--color-border));
		box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.12);
	}

	:global([data-theme='dark']) .sleeve-spine {
		background: rgb(87 83 78);
		box-shadow: inset 0 2px 5px rgb(0 0 0 / 0.28);
	}

	.sleeve-front {
		position: relative;
		z-index: 1;
		margin-left: var(--sleeve-peek);
	}

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
