<script lang="ts">
	import type { SearchPanelContext } from '$lib/types/media';
	import { getSearchFilterLabels } from '$lib/utils/search-filters';

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

<div class="flex flex-wrap gap-2" role="group" aria-label="Search result filters">
	<button
		type="button"
		class="pill-nav text-xs font-bold transition-colors {hideOwned
			? 'bg-amber-400/20 text-amber-800 ring-2 ring-amber-400/50 dark:text-amber-200'
			: 'text-stone-600 hover:bg-stone-200/80 dark:text-stone-400 dark:hover:bg-stone-800'}"
		aria-pressed={hideOwned}
		onclick={toggleHideOwned}
	>
		{labels.hideOwned}
	</button>
	<button
		type="button"
		class="pill-nav text-xs font-bold transition-colors {hideOnList
			? 'bg-amber-400/20 text-amber-800 ring-2 ring-amber-400/50 dark:text-amber-200'
			: 'text-stone-600 hover:bg-stone-200/80 dark:text-stone-400 dark:hover:bg-stone-800'}"
		aria-pressed={hideOnList}
		onclick={toggleHideOnList}
	>
		{labels.hideOnList}
	</button>
</div>
