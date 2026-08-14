<script lang="ts">
	import CategoryPage from '$lib/components/CategoryPage.svelte';

	let { data } = $props();
</script>

<CategoryPage
	category="book"
	title="Books"
	items={data.items}
	albums={data.albums}
	coverUrls={data.coverUrls}
	isAdmin={data.isAdmin}
	noun="books"
	emptyDescription="Search Open Library from the Admin panel to add books to the collection."
/>
