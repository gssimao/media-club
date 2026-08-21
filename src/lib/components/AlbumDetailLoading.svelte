<script lang="ts">
	import MediaGridSkeleton from '$lib/components/MediaGridSkeleton.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
</script>

<PageShell title="Collection">
	{#snippet controls()}
		<div class="skeleton pill-nav min-h-[2.375rem] w-[10rem] rounded-full"></div>
		<div class="skeleton pill-nav min-h-[2.375rem] w-[8rem] rounded-full"></div>
		<div class="skeleton pill-nav min-h-[2.375rem] w-full rounded-full"></div>
	{/snippet}

	<div class="mb-8 flex justify-center" aria-hidden="true">
		<div
			class="skeleton aspect-[3/4] w-full max-w-xs rounded-[2rem] border border-[rgb(var(--color-border))]/30"
		></div>
	</div>

	<MediaGridSkeleton isAdmin showSearch={false} />
</PageShell>
