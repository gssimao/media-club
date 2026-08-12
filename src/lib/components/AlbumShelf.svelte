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
	<section class="mb-8" aria-label="Albums">
		<div class="mb-3 flex items-end justify-between gap-3">
			<h2 class="text-sm font-black tracking-wide text-stone-700 uppercase dark:text-stone-300">
				Albums
			</h2>
			<a
				href="/albums/{category}"
				class="pill-nav bg-amber-400/10 text-amber-600 hover:bg-amber-400/20 dark:text-amber-400"
			>
				See all
			</a>
		</div>
		<div class="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			{#each preview as album (album.id)}
				<AlbumCard album={album} displayCoverUrl={coverUrls[album.id] ?? null} />
			{/each}
		</div>
	</section>
{/if}
