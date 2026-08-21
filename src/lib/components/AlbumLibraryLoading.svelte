<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
</script>

<PageShell title="Collections">
	{#snippet controls()}
		<div class="skeleton pill-nav min-h-[2.375rem] w-[9rem] rounded-full"></div>
	{/snippet}

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
		{#each [0, 1, 2, 3, 4, 5] as index (index)}
			<div
				class="skeleton aspect-[3/4] w-full rounded-[1.5rem] border border-[rgb(var(--color-border))]/30"
			></div>
		{/each}
	</div>
</PageShell>
