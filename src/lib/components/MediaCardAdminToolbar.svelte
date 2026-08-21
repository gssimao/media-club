<script lang="ts">
	import { DotsThree } from 'phosphor-svelte';
	import type { MediaItem } from '$lib/types/media';

	interface Props {
		item: MediaItem;
		showAdminMenu: boolean;
		onToggleMenu: () => void;
	}

	let { item, showAdminMenu, onToggleMenu }: Props = $props();
</script>

<div class="flex items-center gap-1">
	<button
		type="button"
		class="inline-flex size-7 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-text-secondary))] shadow-sm transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400 {showAdminMenu
			? 'border-amber-500 text-amber-700 dark:text-amber-400'
			: ''}"
		aria-label="Item options for {item.title}"
		aria-expanded={showAdminMenu}
		aria-controls="item-actions-{item.id}"
		onclick={onToggleMenu}
	>
		<DotsThree size={16} weight="bold" />
	</button>
</div>
