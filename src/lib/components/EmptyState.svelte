<script lang="ts">
	import VinylDisc from './VinylDisc.svelte';

	interface Props {
		title: string;
		description?: string;
	}

	let { title, description }: Props = $props();
</script>

<div class="surface-round px-6 py-10 text-center">
	<VinylDisc class="mx-auto size-12 opacity-70" />
	<h2 class="mt-5 text-lg font-semibold text-[rgb(var(--color-text))]">{title}</h2>
	{#if description}
		<p class="mx-auto mt-2 max-w-md text-sm font-medium text-stone-600 dark:text-stone-400">
			{description}
		</p>
	{/if}
</div>
