<script lang="ts">
	import type { Album, MediaCategory } from '$lib/types/media';
	import AlbumCard from './AlbumCard.svelte';

	interface Props {
		albums: Album[];
		category: MediaCategory;
		coverUrls?: Record<string, string | null>;
	}

	let { albums, category, coverUrls = {} }: Props = $props();

	const preview = $derived(albums.slice(0, 6));
</script>

{#if preview.length > 0}
	<section class="mb-8" aria-label="Collections">
		<div class="mb-3 flex items-end justify-between gap-3">
			<h2 class="text-sm font-black tracking-wide text-stone-700 uppercase dark:text-stone-300">
				Collections
			</h2>
			<a
				href="/albums/{category}"
				class="pill-nav bg-amber-400/15 text-amber-700 hover:bg-amber-400/25 dark:text-amber-400"
			>
				See all
			</a>
		</div>
		<div class="relative">
			<div
				class="flex snap-x [scrollbar-width:none] gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
			>
				{#each preview as album, index (album.id)}
					<div class="anim-rise shrink-0 snap-start" style="--rise-delay: {index * 50}ms">
						<AlbumCard {album} displayCoverUrl={coverUrls[album.id] ?? null} />
					</div>
				{/each}
			</div>
			<!-- Edge fade hints that the shelf keeps scrolling -->
			<div
				class="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[rgb(var(--color-bg))] to-transparent"
				aria-hidden="true"
			></div>
		</div>
	</section>
{/if}
