<script lang="ts">
	import CategoryPage from '$lib/components/CategoryPage.svelte';

	let { data } = $props();
</script>

<CategoryPage
	category="music"
	title="Music"
	description="Vinyl and records in the collection."
	items={data.items}
	albums={data.albums}
	coverUrls={data.coverUrls}
	isAdmin={data.isAdmin}
	noun="records"
	emptyDescription="Search Discogs from the Admin panel to add vinyl to the collection."
/>
