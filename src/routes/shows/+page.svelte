<script lang="ts">
	import CategoryPage from '$lib/components/CategoryPage.svelte';

	let { data } = $props();
</script>

<CategoryPage
	category="show"
	title="Shows"
	items={data.items}
	allItems={data.allItems}
	albums={data.albums}
	coverUrls={data.coverUrls}
	isAdmin={data.isAdmin}
	noun="shows"
	emptyDescription="When you're logged in as admin, add shows from the Admin panel."
/>
