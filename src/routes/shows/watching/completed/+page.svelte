<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import ShowTrackerNav from '$lib/components/ShowTrackerNav.svelte';
	import ShowTrackerCard from '$lib/components/ShowTrackerCard.svelte';
	import ShowTrackerSearchPanel from '$lib/components/ShowTrackerSearchPanel.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import { MagnifyingGlass } from 'phosphor-svelte';
	import { mediaGridClass } from '$lib/utils/media-grid';
	import { settings } from '$lib/stores/settings.svelte';
	let { data } = $props();
	let showSearch = $state(false);
	let query = $state('');
	const visibleItems = $derived(
		data.completedItems.filter((item) =>
			item.title.toLowerCase().includes(query.trim().toLowerCase())
		)
	);
</script>

<svelte:head><title>Completed watch · Shows · Media Club</title></svelte:head>
<PageShell
	title="Completed watch"
	description="Shows I've finished watching without adding them to my owned collection."
>
	{#snippet controls()}
		<NavLink href="/shows" variant="accent">Back to shows</NavLink>
		{#if data.isAdmin}<button
				type="button"
				class="pill-nav control-pill--primary"
				onclick={() => (showSearch = !showSearch)}
				><MagnifyingGlass size={16} />{showSearch ? 'Hide search' : 'Add a completed show'}</button
			>{/if}
	{/snippet}
	<ShowTrackerNav completed count={data.completedItems.length} />
	{#if data.isAdmin && showSearch}<div class="surface-round mb-8 p-5">
			<ShowTrackerSearchPanel initialSection="completed" />
		</div>{/if}
	{#if data.completedItems.length}
		<div class="mb-6">
			<SearchBar
				bind:value={query}
				onInput={(value) => (query = value)}
				placeholder="Search completed shows…"
			/>
		</div>
		<div class={mediaGridClass(settings.density)}>
			{#each visibleItems as item (item.id)}<ShowTrackerCard
					{item}
					isAdmin={data.isAdmin}
					genreCatalogItems={data.allTrackerItems}
				/>{/each}
		</div>
		{#if !visibleItems.length}<p class="surface-round p-6 text-sm">
				No completed shows match your search.
			</p>{/if}
	{:else}<p class="surface-round p-8 text-center text-sm">
			No completed shows yet.{#if data.isAdmin}
				Mark a tracked show as completed, or add one from search.{/if}
		</p>{/if}
</PageShell>
