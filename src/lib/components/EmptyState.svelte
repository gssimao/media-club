<script lang="ts">
	import VinylDisc from './VinylDisc.svelte';

	interface Props {
		title: string;
		description?: string;
	}

	let { title, description }: Props = $props();
</script>

<div class="surface-round border-dashed px-6 py-14 text-center">
	<VinylDisc spinning class="mx-auto size-16 opacity-75" />
	<h2 class="mt-5 text-lg font-black text-stone-900 uppercase dark:text-white">{title}</h2>
	{#if description}
		<p class="mx-auto mt-2 max-w-md text-sm font-medium text-stone-600 dark:text-stone-400">
			{description}
		</p>
	{/if}
</div>
