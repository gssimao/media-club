<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import MediaSearchPanel from '$lib/components/MediaSearchPanel.svelte';
	import { type MediaCategory } from '$lib/types/media';

	let category = $state<MediaCategory>('movie');
</script>

<svelte:head>
	<title>Add items · Media Club</title>
</svelte:head>

<PageShell
	title="Add from search"
	description="Search TMDB, Discogs, or Open Library, then add results to the collection or wishlist."
>
	{#snippet controls()}
		<label class="space-y-2 text-sm">
			<span class="font-bold text-stone-700 dark:text-stone-300">Category</span>
			<select bind:value={category} class="input-round input-round--control w-full">
				<option value="movie">Movies (TMDB)</option>
				<option value="music">Music (Discogs)</option>
				<option value="book">Books (Open Library)</option>
			</select>
		</label>
	{/snippet}

	{#key category}
		<MediaSearchPanel {category} />
	{/key}
</PageShell>
