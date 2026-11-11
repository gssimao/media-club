<script lang="ts">
	import type { SearchPanelContext } from '$lib/types/media';
	import { getSearchFilterLabels } from '$lib/utils/search-filters';
	import { Check, Circle } from 'phosphor-svelte';

	interface Props {
		context: SearchPanelContext;
		hideOwned?: boolean;
		hideOnList?: boolean;
		onHideOwnedChange?: (value: boolean) => void;
		onHideOnListChange?: (value: boolean) => void;
	}

	let {
		context,
		hideOwned = $bindable(true),
		hideOnList = $bindable(true),
		onHideOwnedChange,
		onHideOnListChange
	}: Props = $props();

	const labels = $derived(getSearchFilterLabels(context));

	function toggleHideOwned() {
		hideOwned = !hideOwned;
		onHideOwnedChange?.(hideOwned);
	}

	function toggleHideOnList() {
		hideOnList = !hideOnList;
		onHideOnListChange?.(hideOnList);
	}
</script>

<!-- Both states are drawn as pills (outlined when off, amber when on) with a leading
     mark, so an inactive filter still reads as a button and toggling never shifts layout. -->
{#snippet toggle(label: string, pressed: boolean, onclick: () => void)}
	<button
		type="button"
		class="pill-nav text-xs font-bold ring-inset {pressed
			? 'bg-amber-400/20 text-amber-800 ring-2 ring-amber-400/60 dark:text-amber-200'
			: 'text-[rgb(var(--color-text-secondary))] ring-1 ring-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-accent-light))]/50 hover:text-[rgb(var(--color-text))]'}"
		aria-pressed={pressed}
		{onclick}
	>
		{#if pressed}
			<Check size={14} weight="bold" />
		{:else}
			<Circle size={14} weight="bold" class="opacity-50" />
		{/if}
		{label}
	</button>
{/snippet}

<div class="flex flex-wrap gap-2" role="group" aria-label="Search result filters">
	{@render toggle(labels.hideOwned, hideOwned, toggleHideOwned)}
	{@render toggle(labels.hideOnList, hideOnList, toggleHideOnList)}
</div>
