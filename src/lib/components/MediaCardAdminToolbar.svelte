<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { DotsThree, Trash } from 'phosphor-svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { MediaItem } from '$lib/types/media';

	interface Props {
		item: MediaItem;
		showAdminMenu: boolean;
		onToggleMenu: () => void;
		onDeleteConfirm: () => void;
		showDeleteConfirm: boolean;
		onCancelDelete: () => void;
		onConfirmDelete: () => void;
		deleteForm: HTMLFormElement | undefined;
	}

	let {
		item,
		showAdminMenu,
		onToggleMenu,
		onDeleteConfirm,
		showDeleteConfirm,
		onCancelDelete,
		onConfirmDelete,
		deleteForm = $bindable()
	}: Props = $props();
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
	<button
		type="button"
		class="inline-flex size-7 items-center justify-center rounded-full border border-red-400/80 bg-[rgb(var(--color-surface-raised))] text-red-700 shadow-sm transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
		aria-label="Delete {item.title}"
		onclick={onDeleteConfirm}
	>
		<Trash size={13} weight="bold" />
	</button>
</div>

<form
	bind:this={deleteForm}
	method="POST"
	action="/admin/items?/delete"
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				toast.error(String(result.data?.message ?? 'Could not delete item.'));
			} else {
				toast.success(`Removed "${item.title}" from the catalog.`);
			}
			await update();
		};
	}}
>
	<input type="hidden" name="id" value={item.id} />
</form>

<ConfirmDialog
	open={showDeleteConfirm}
	title="Delete item?"
	message={`Remove "${item.title}" from the catalog? This cannot be undone.`}
	confirmLabel="Delete"
	cancelLabel="Keep it"
	variant="danger"
	onCancel={onCancelDelete}
	onConfirm={onConfirmDelete}
/>
