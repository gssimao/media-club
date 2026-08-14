<script lang="ts">
	import CategoryPage from '$lib/components/CategoryPage.svelte';

	let { data } = $props();
</script>

<CategoryPage
	category="movie"
	title="Movies"
	items={data.items}
	albums={data.albums}
	coverUrls={data.coverUrls}
	isAdmin={data.isAdmin}
	noun="movies"
	emptyDescription="When you're logged in as admin, add movies from the Admin panel."
/>
