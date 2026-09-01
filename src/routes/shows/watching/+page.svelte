<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import ShowTrackerCard from '$lib/components/ShowTrackerCard.svelte';
	import ShowTrackerSearchPanel from '$lib/components/ShowTrackerSearchPanel.svelte';
	import { MagnifyingGlass } from 'phosphor-svelte';

	let { data } = $props();

	let showSearch = $state(false);

	const isEmpty = $derived(data.watchingItems.length === 0 && data.upcomingItems.length === 0);
	const genreCatalogItems = $derived(data.allTrackerItems);
</script>

<svelte:head>
	<title>Show tracker · Media Club</title>
</svelte:head>

<PageShell
	title="Show tracker"
	description="Keep track of shows you're watching and ones coming back soon. These don't have to be in your collection."
>
	{#snippet controls()}
		<NavLink href="/shows" variant="accent">Back to shows</NavLink>

		{#if data.isAdmin}
			<button
				type="button"
				class="pill-nav control-pill--primary"
				onclick={() => (showSearch = !showSearch)}
			>
				<MagnifyingGlass size={16} weight="bold" />
				{showSearch ? 'Hide search' : 'Add from search'}
			</button>
		{/if}
	{/snippet}

	{#if data.isAdmin && showSearch}
		<div class="surface-round mb-8 p-5">
			<ShowTrackerSearchPanel />
		</div>
	{/if}

	{#if isEmpty}
		<div class="surface-round p-8 text-center">
			<p class="text-sm font-medium text-stone-600 dark:text-stone-400">
				{#if data.isAdmin}
					Nothing on the tracker yet. Search TMDB to add shows you're watching or ones to keep an
					eye on.
				{:else}
					Nothing on the show tracker yet.
				{/if}
			</p>
		</div>
	{:else}
		{#if data.watchingItems.length > 0}
			<h2
				class="mb-4 text-sm font-black tracking-wide text-stone-700 uppercase dark:text-stone-300"
			>
				Currently watching
			</h2>
			<div
				class="mb-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
			>
				{#each data.watchingItems as item (item.id)}
					<div class="flex h-full min-w-0 flex-col">
						<ShowTrackerCard {item} isAdmin={data.isAdmin} {genreCatalogItems} />
					</div>
				{/each}
			</div>
		{/if}

		{#if data.upcomingItems.length > 0}
			<h2
				class="mb-4 text-sm font-black tracking-wide text-stone-700 uppercase dark:text-stone-300"
			>
				Coming up and returning
			</h2>
			<div class="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each data.upcomingItems as item (item.id)}
					<div class="flex h-full min-w-0 flex-col">
						<ShowTrackerCard {item} isAdmin={data.isAdmin} {genreCatalogItems} />
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</PageShell>
