<script lang="ts">
	import type { Album } from '$lib/types/media';

	interface Props {
		album: Album;
		displayCoverUrl?: string | null;
	}

	let { album, displayCoverUrl = null }: Props = $props();

	const cover = $derived(displayCoverUrl ?? album.coverUrl);
</script>

<div class="mx-auto w-full max-w-xs">
	<div class="relative">
		<div
			class="absolute top-2 -left-2 h-[calc(100%-0.5rem)] w-4 rounded-l-full bg-stone-300 shadow-inner dark:bg-stone-600"
			aria-hidden="true"
		></div>
		<div
			class="relative ml-2 aspect-[3/4] overflow-hidden rounded-[2rem] border-2 border-amber-400/50 bg-stone-100 shadow-xl dark:bg-stone-900"
		>
			{#if cover}
				<img src={cover} alt="{album.title} album cover" class="h-full w-full object-cover" />
			{:else}
				<div
					class="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-stone-500 dark:text-stone-400"
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
