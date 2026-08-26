<script lang="ts">
	import type { Album } from '$lib/types/media';
	import { getAlbumColorPreset } from '$lib/theme/album-colors';
	import { cn } from '$lib/utils/cn';
	import AlbumSleevePattern from './AlbumSleevePattern.svelte';
	import CoverImage from './CoverImage.svelte';
	import DvdDisc from './DvdDisc.svelte';
	import VinylDisc from './VinylDisc.svelte';

	interface Props {
		album: Album;
		displayCoverUrl?: string | null;
	}

	let { album, displayCoverUrl = null }: Props = $props();

	const cover = $derived(displayCoverUrl ?? album.coverUrl);
	const colorPreset = $derived(getAlbumColorPreset(album.accentColor));
	const isMovie = $derived(album.category === 'movie');

	let sleeveHovered = $state(false);
</script>

<div
	class="sleeve-hero group mx-auto w-full max-w-xs"
	onmouseenter={() => (sleeveHovered = true)}
	onmouseleave={() => (sleeveHovered = false)}
>
	<div class="card-art">
		{#if isMovie}
			<div class="dvd-case-assembly">
				<div class="dvd-disc-slot" aria-hidden="true">
					<DvdDisc class="size-full drop-shadow-lg" />
				</div>
				<div class="dvd-spine" aria-hidden="true"></div>
				<div
					class={cn(
						'dvd-front aspect-[7/10] overflow-hidden rounded-[2rem] border-2 shadow-xl',
						colorPreset.border,
						cover ? 'bg-[rgb(var(--color-surface))] dark:bg-stone-900' : colorPreset.background
					)}
				>
					{#if cover}
						<CoverImage
							src={cover}
							alt="{album.title} collection cover"
							class="h-full w-full object-cover"
							hovered={sleeveHovered}
						/>
					{:else}
						<AlbumSleevePattern seed={album.id} accentColor={album.accentColor} />
					{/if}
				</div>
			</div>
		{:else}
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
						<CoverImage
							src={cover}
							alt="{album.title} collection cover"
							class="h-full w-full object-cover"
							hovered={sleeveHovered}
						/>
					{:else}
						<AlbumSleevePattern seed={album.id} accentColor={album.accentColor} />
						<div class="relative z-[1] flex h-full items-center justify-center p-6">
							<VinylDisc class="size-[58%] drop-shadow-md" />
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
	{#if album.description}
		<p class="mt-4 text-center text-sm font-medium text-stone-600 dark:text-stone-400">
			{album.description}
		</p>
	{/if}
</div>

<style>
	.card-art {
		position: relative;
		isolation: isolate;
		overflow: hidden;
	}

	.sleeve-hero:hover .card-art {
		overflow: visible;
	}

	.sleeve-assembly,
	.dvd-case-assembly {
		position: relative;
		width: 100%;
	}

	.sleeve-assembly {
		--sleeve-peek: 14px;
		--sleeve-underlap: 35px;
	}

	.dvd-case-assembly {
		--case-peek: 10px;
		--case-underlap: 26px;
	}

	.sleeve-spine,
	.dvd-spine {
		position: absolute;
		top: 0.5rem;
		bottom: 0.25rem;
		left: 0;
		z-index: 0;
		background: rgb(var(--color-border));
		box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.12);
	}

	.sleeve-spine {
		width: calc(var(--sleeve-peek) + var(--sleeve-underlap));
		border-radius: 2rem 0 0 2rem;
	}

	.dvd-spine {
		width: calc(var(--case-peek) + var(--case-underlap));
		border-radius: 2rem 0 0 2rem;
		z-index: 1;
	}

	:global([data-theme='dark']) .sleeve-spine,
	:global([data-theme='dark']) .dvd-spine {
		background: rgb(87 83 78);
		box-shadow: inset 0 2px 5px rgb(0 0 0 / 0.28);
	}

	.sleeve-front {
		position: relative;
		z-index: 1;
		margin-left: var(--sleeve-peek);
	}

	.dvd-front {
		position: relative;
		z-index: 2;
		margin-left: var(--case-peek);
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

	.dvd-disc-slot {
		position: absolute;
		bottom: 6%;
		right: 5%;
		z-index: 0;
		width: 58%;
		aspect-ratio: 1;
		transform: translateX(10%) translateY(4%);
		transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.sleeve-hero:hover .dvd-disc-slot {
		transform: translateX(46%) translateY(-14%) scale(1.08) rotate(-10deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.album-disc,
		.dvd-disc-slot {
			transition: none;
		}

		.sleeve-hero:hover .album-disc {
			transform: translateY(-50%);
		}

		.sleeve-hero:hover .dvd-disc-slot {
			transform: translateX(10%) translateY(4%);
		}
	}

	:global([data-motion='reduced']) .album-disc,
	:global([data-motion='reduced']) .dvd-disc-slot {
		transition: none;
	}

	:global([data-motion='reduced']) .sleeve-hero:hover .album-disc {
		transform: translateY(-50%);
	}

	:global([data-motion='reduced']) .sleeve-hero:hover .dvd-disc-slot {
		transform: translateX(10%) translateY(4%);
	}
</style>
