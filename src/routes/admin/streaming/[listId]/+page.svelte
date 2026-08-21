<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import AddStreamingDialog from '$lib/components/AddStreamingDialog.svelte';
	import AlbumRandomPicker from '$lib/components/AlbumRandomPicker.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import StreamingListItemCard from '$lib/components/StreamingListItemCard.svelte';
	import StreamingSearchPanel from '$lib/components/StreamingSearchPanel.svelte';
	import type { StreamingListItemView } from '$lib/server/streaming-lists';
	import { MagnifyingGlass, Pencil } from 'phosphor-svelte';

	let { data } = $props();

	const unwatchedItems = $derived(
		data.items.filter((item: StreamingListItemView) => !item.watchedAt)
	);
	const watchedItems = $derived(data.items.filter((item: StreamingListItemView) => item.watchedAt));

	let highlightedId = $state<string | null>(null);
	let showSearch = $state(false);
	let showManualDialog = $state(false);

	function handlePick(item: { id: string; title: string }) {
		highlightedId = item.id;
		requestAnimationFrame(() => {
			document.getElementById(`streaming-item-${item.id}`)?.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		});
	}
</script>

<svelte:head>
	<title>{data.list.title} · Streaming · Media Club</title>
</svelte:head>

<PageShell title={data.list.title} description={data.list.description ?? undefined}>
	{#snippet controls()}
		<NavLink href="/admin/streaming" variant="accent">All streaming lists</NavLink>
		<NavLink href="/admin">Back to admin</NavLink>

		<AlbumRandomPicker
			unwatchedItems={unwatchedItems.map((item) => ({ id: item.id, title: item.title }))}
			category="movie"
			isAdmin={data.isAdmin}
			onPick={handlePick}
			markWatchedAction="?/toggleWatched"
		/>

		<button
			type="button"
			class="pill-nav control-pill--primary"
			onclick={() => (showSearch = !showSearch)}
		>
			<MagnifyingGlass size={16} weight="bold" />
			{showSearch ? 'Hide search' : 'Add from search'}
		</button>
		<button
			type="button"
			class="pill-nav control-pill--secondary"
			onclick={() => (showManualDialog = true)}
		>
			<Pencil size={16} weight="bold" />
			Manual entry
		</button>
	{/snippet}

	{#if showSearch}
		<div class="surface-round mb-8 p-5">
			<StreamingSearchPanel listId={data.list.id} />
		</div>
	{/if}

	{#if data.items.length === 0}
		<div class="surface-round p-8 text-center">
			<p class="text-sm font-medium text-stone-600 dark:text-stone-400">
				This streaming list is empty. Search TMDB or use manual entry to add movies for random
				picks.
			</p>
		</div>
	{:else}
		{#if unwatchedItems.length > 0}
			<h2
				class="mb-4 text-sm font-black tracking-wide text-stone-700 uppercase dark:text-stone-300"
			>
				To watch
			</h2>
			<div
				class="mb-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
			>
				{#each unwatchedItems as item (item.id)}
					<div
						class={highlightedId === item.id
							? 'rounded-[2rem] ring-4 ring-amber-400/60 ring-offset-2 ring-offset-[rgb(var(--color-bg))]'
							: ''}
					>
						<StreamingListItemCard {item} />
					</div>
				{/each}
			</div>
		{/if}

		{#if watchedItems.length > 0}
			<h2
				class="mb-4 text-sm font-black tracking-wide text-stone-700 uppercase dark:text-stone-300"
			>
				Already watched
			</h2>
			<div
				class="grid grid-cols-2 gap-x-3 gap-y-8 opacity-75 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
			>
				{#each watchedItems as item (item.id)}
					<StreamingListItemCard {item} />
				{/each}
			</div>
		{/if}
	{/if}
</PageShell>

<AddStreamingDialog
	listId={data.list.id}
	isOpen={showManualDialog}
	onClose={() => (showManualDialog = false)}
/>
