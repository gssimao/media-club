<script lang="ts">
	import type { Album } from '$lib/types/media';
	import { getAlbumColorPreset } from '$lib/theme/album-colors';
	import { cn } from '$lib/utils/cn';
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
</script>

<a href={link} class="group flex w-[8.5rem] shrink-0 flex-col sm:w-[9.5rem]">
	<div class="relative">
		<div class="album-disc" aria-hidden="true">
			<VinylDisc class="size-full" />
		</div>
		<div class="sleeve-assembly">
			<div class="sleeve-spine" aria-hidden="true"></div>
			<div
				class={cn(
					'sleeve-front aspect-[3/4] overflow-hidden rounded-[1.5rem] border-2 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg',
					colorPreset.border,
					cover ? 'bg-[rgb(var(--color-surface))] dark:bg-stone-900' : colorPreset.background
				)}
			>
				{#if cover}
					<img
						src={cover}
						alt="{album.title} album cover"
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
				{:else}
					<div class="flex h-full items-center justify-center p-4">
						<VinylDisc class="size-[55%]" />
					</div>
				{/if}
			</div>
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
	.sleeve-assembly {
		position: relative;
		width: 100%;
		--sleeve-peek: 8px;
		--sleeve-underlap: 18px;
	}

	.sleeve-spine {
		position: absolute;
		top: 0.25rem;
		bottom: 0.125rem;
		left: 0;
		z-index: 0;
		width: calc(var(--sleeve-peek) + var(--sleeve-underlap));
		border-radius: 1.5rem 0 0 1.5rem;
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
