<script lang="ts">
	import CategoryPage from '$lib/components/CategoryPage.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import { MonitorPlay } from 'phosphor-svelte';

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
>
	{#snippet extraControls()}
		<NavLink href="/shows/watching" variant="accent">
			<MonitorPlay size={16} weight="bold" />
			Show tracker
		</NavLink>
	{/snippet}
</CategoryPage>
