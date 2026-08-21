<script lang="ts">
	import AlbumShelfSkeleton from '$lib/components/AlbumShelfSkeleton.svelte';
	import MediaGridSkeleton from '$lib/components/MediaGridSkeleton.svelte';
	import PageShell from '$lib/components/PageShell.svelte';

	interface Props {
		title: string;
		showShelf?: boolean;
		isAdmin?: boolean;
	}

	let { title, showShelf = true, isAdmin = true }: Props = $props();

	const controlWidths = ['w-[9.5rem]', 'w-[8.5rem]', 'w-[6.5rem]', 'w-[7.5rem]', 'w-[10rem]'];
</script>

<PageShell {title}>
	{#snippet controls()}
		{#each controlWidths as width, index (index)}
			<div class="skeleton pill-nav min-h-[2.375rem] {width} rounded-full"></div>
		{/each}
	{/snippet}

	{#if showShelf}
		<AlbumShelfSkeleton />
	{/if}

	<MediaGridSkeleton {isAdmin} />
</PageShell>
