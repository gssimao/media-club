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
		href?: string;
	}

	let { album, displayCoverUrl = null, href }: Props = $props();

	const link = $derived(href ?? `/albums/${album.category}/${album.id}`);
	const cover = $derived(displayCoverUrl ?? album.coverUrl);
	const colorPreset = $derived(getAlbumColorPreset(album.accentColor));
	const isMovie = $derived(album.category === 'movie');

	let cardHovered = $state(false);
</script>

<a
	href={link}
	class="group relative z-0 flex w-[8.5rem] shrink-0 flex-col hover:z-10 sm:w-[9.5rem]"
	onmouseenter={() => (cardHovered = true)}
	onmouseleave={() => (cardHovered = false)}
>
	<div class="card-art">
		{#if isMovie}
			<div class="dvd-case-assembly transition-transform duration-300 group-hover:-translate-y-1">
				<div class="dvd-disc-slot" aria-hidden="true">
					<DvdDisc class="size-full drop-shadow-md" />
				</div>
				<div class="dvd-spine" aria-hidden="true"></div>
				<div
					class={cn(
						'dvd-front aspect-[7/10] overflow-hidden rounded-[1.5rem] border-2 shadow-md transition-shadow duration-300 group-hover:shadow-lg',
						colorPreset.border,
						cover ? 'bg-[rgb(var(--color-surface))] dark:bg-stone-900' : colorPreset.background
					)}
				>
					{#if cover}
						<CoverImage
							src={cover}
							alt="{album.title} collection cover"
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							hovered={cardHovered}
						/>
					{:else}
						<AlbumSleevePattern seed={album.id} accentColor={album.accentColor} />
					{/if}
				</div>
			</div>
		{:else}
			<div class="album-disc" aria-hidden="true">
				<VinylDisc class="size-full" />
			</div>
			<div class="sleeve-assembly transition-transform duration-300 group-hover:-translate-y-1">
				<div class="sleeve-spine" aria-hidden="true"></div>
				<div
					class={cn(
						'sleeve-front aspect-[3/4] overflow-hidden rounded-[1.5rem] border-2 shadow-md transition-shadow duration-300 group-hover:shadow-lg',
						colorPreset.border,
						cover ? 'bg-[rgb(var(--color-surface))] dark:bg-stone-900' : colorPreset.background
					)}
				>
					{#if cover}
						<CoverImage
							src={cover}
							alt="{album.title} collection cover"
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							hovered={cardHovered}
						/>
					{:else}
						<AlbumSleevePattern seed={album.id} accentColor={album.accentColor} />
						<div class="relative z-[1] flex h-full items-center justify-center p-4">
							<VinylDisc class="size-[55%]" />
						</div>
					{/if}
				</div>
			</div>
		{/if}
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
	.card-art {
		position: relative;
		isolation: isolate;
		overflow: hidden;
	}

	.group:hover .card-art {
		overflow: visible;
	}

	.sleeve-assembly,
	.dvd-case-assembly {
		position: relative;
		width: 100%;
	}

	.sleeve-assembly {
		--sleeve-peek: 8px;
		--sleeve-underlap: 18px;
	}

	.dvd-case-assembly {
		--case-peek: 6px;
		--case-underlap: 14px;
	}

	.sleeve-spine,
	.dvd-spine {
		position: absolute;
		top: 0.25rem;
		bottom: 0.125rem;
		left: 0;
		z-index: 0;
		border-radius: 1.5rem 0 0 1.5rem;
		background: rgb(var(--color-border));
		box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.12);
	}

	.sleeve-spine {
		width: calc(var(--sleeve-peek) + var(--sleeve-underlap));
	}

	.dvd-spine {
		width: calc(var(--case-peek) + var(--case-underlap));
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
		right: 0.35rem;
		width: 72%;
		aspect-ratio: 1;
		transform: translateY(-50%);
		transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
	}

	a:hover .album-disc {
		transform: translateY(-50%) translateX(24%) rotate(28deg);
	}

	.dvd-disc-slot {
		position: absolute;
		bottom: 6%;
		right: 4%;
		z-index: 0;
		width: 56%;
		aspect-ratio: 1;
		transform: translateX(8%) translateY(4%);
		transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
	}

	a:hover .dvd-disc-slot {
		transform: translateX(42%) translateY(-12%) scale(1.06) rotate(-8deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.album-disc,
		.dvd-disc-slot {
			transition: none;
		}

		a:hover .album-disc {
			transform: translateY(-50%);
		}

		a:hover .dvd-disc-slot {
			transform: translateX(8%) translateY(4%);
		}
	}

	:global([data-motion='reduced']) .album-disc,
	:global([data-motion='reduced']) .dvd-disc-slot {
		transition: none;
	}

	:global([data-motion='reduced']) a:hover .album-disc {
		transform: translateY(-50%);
	}

	:global([data-motion='reduced']) a:hover .dvd-disc-slot {
		transform: translateX(8%) translateY(4%);
	}
</style>
