<script lang="ts">
	import MediaCardSkeleton from '$lib/components/MediaCardSkeleton.svelte';
	import { settings } from '$lib/stores/settings.svelte';

	interface Props {
		isAdmin?: boolean;
		showSearch?: boolean;
		showSectionHeader?: boolean;
		/** Override placeholder card count (defaults from shelf density). */
		count?: number;
	}

	let { isAdmin = false, showSearch = true, showSectionHeader = true, count }: Props = $props();

	const placeholderCount = $derived(count ?? (settings.density === 'compact' ? 8 : 6));

	const gridClass = $derived(
		settings.density === 'compact'
			? 'grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7'
			: 'grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
	);
</script>

<div class="media-grid-skeleton" aria-busy="true" aria-label="Loading catalog">
	{#if showSearch}
		<div class="media-grid-skeleton__search">
			<div class="skeleton h-[2.75rem] w-full rounded-full"></div>
		</div>
	{/if}

	<div class="media-grid-skeleton__body space-y-6">
		{#if showSectionHeader}
			<div class="flex items-center justify-between">
				<div class="skeleton h-4 w-24 rounded-full"></div>
			</div>
		{/if}

		<div class={gridClass}>
			{#each Array.from({ length: placeholderCount }, (_, index) => index) as index (index)}
				<div class="flex h-full min-w-0 flex-col">
					<MediaCardSkeleton {isAdmin} />
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.media-grid-skeleton__search {
		margin-bottom: 1.5rem;
	}

	.media-grid-skeleton__body {
		min-width: 0;
	}
</style>
