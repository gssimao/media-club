<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import CoverSearchPicker from './CoverSearchPicker.svelte';
	import type { MediaCardAdminAction } from './MediaCardAdminToolbar.svelte';
	import ModalShell from './ModalShell.svelte';
	import { CATEGORY_LABELS, type MediaItem } from '$lib/types/media';
	import { toast } from '$lib/stores/toast.svelte';

	interface Props {
		item: MediaItem;
	}

	let { item }: Props = $props();

	const collectionLabel = $derived(CATEGORY_LABELS[item.category]);

	let editingNotes = $state(false);
	let editingCover = $state(false);
	let pendingCoverUrl = $state<string | null>(null);
	let pendingCoverMetadata = $state<string>('');
	let coverForm: HTMLFormElement | undefined = $state();
	let moveForm: HTMLFormElement | undefined = $state();
	let deleteForm: HTMLFormElement | undefined = $state();
	let showMoveConfirm = $state(false);
	let showDeleteConfirm = $state(false);

	/**
	 * Runs an action picked from the card's options menu (MediaCardAdminToolbar).
	 * Notes and cover open in a dialog rather than inside the card: the card is too narrow
	 * for a search grid, and growing it pushed the neighbouring cards' controls around.
	 */
	export function run(action: MediaCardAdminAction) {
		if (action === 'move') showMoveConfirm = true;
		else if (action === 'delete') showDeleteConfirm = true;
		else if (action === 'notes') editingNotes = true;
		else if (action === 'cover') editingCover = true;
	}

	function closeCoverEditor() {
		editingCover = false;
		pendingCoverUrl = null;
		pendingCoverMetadata = '';
	}

	function handleCoverSelect(coverUrl: string, metadata?: Record<string, unknown>) {
		pendingCoverUrl = coverUrl;
		pendingCoverMetadata = metadata ? JSON.stringify(metadata) : '';
		void tick().then(() => coverForm?.requestSubmit());
	}
</script>

<ModalShell
	open={editingNotes}
	title="Edit notes"
	description={item.title}
	size="sm"
	onClose={() => (editingNotes = false)}
>
	<form
		method="POST"
		action="/admin/items?/updateNotes"
		class="space-y-4"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'failure' || result.type === 'error') {
					toast.error(
						result.type === 'failure'
							? String(result.data?.message ?? 'Could not save notes.')
							: 'Could not save notes.'
					);
					return;
				}
				toast.success('Notes saved.');
				editingNotes = false;
				await update({ reset: false });
			};
		}}
	>
		<input type="hidden" name="id" value={item.id} />
		<!-- svelte-ignore a11y_autofocus -->
		<textarea
			name="notes"
			rows="4"
			maxlength="2000"
			aria-label="Notes for {item.title}"
			class="w-full rounded-[1.5rem] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] px-4 py-3 text-sm text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:border-amber-400 focus:outline-none"
			placeholder="Edition, condition, personal notes…"
			autofocus>{item.notes ?? ''}</textarea
		>
		<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<button
				type="button"
				class="btn-secondary justify-center px-5 py-2.5 text-sm"
				onclick={() => (editingNotes = false)}
			>
				Cancel
			</button>
			<button type="submit" class="btn-primary justify-center px-5 py-2.5 text-sm">
				Save notes
			</button>
		</div>
	</form>
</ModalShell>

{#if item.category === 'movie'}
	<ModalShell
		open={editingCover}
		title="Change cover"
		description="Search for {item.title} and tap the artwork you want"
		size="md"
		onClose={closeCoverEditor}
	>
		<div class="space-y-4">
			<CoverSearchPicker category="movie" onSelect={handleCoverSelect} />

			<form
				bind:this={coverForm}
				method="POST"
				action="/admin/items?/updateCover"
				class="hidden"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'failure' || result.type === 'error') {
							toast.error('Could not update the cover.');
							return;
						}
						toast.success('Cover updated.');
						closeCoverEditor();
						await update({ reset: false });
					};
				}}
			>
				<input type="hidden" name="id" value={item.id} />
				<input type="hidden" name="coverUrl" value={pendingCoverUrl ?? ''} />
				<input type="hidden" name="metadata" value={pendingCoverMetadata} />
			</form>

			<form
				method="POST"
				action="/admin/items?/updateCover"
				class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'failure' || result.type === 'error') {
							toast.error('Could not remove the cover.');
							return;
						}
						toast.success('Cover removed.');
						closeCoverEditor();
						await update({ reset: false });
					};
				}}
			>
				<input type="hidden" name="id" value={item.id} />
				<input type="hidden" name="coverUrl" value="" />
				<button
					type="button"
					class="btn-secondary justify-center px-5 py-2.5 text-sm"
					onclick={closeCoverEditor}
				>
					Cancel
				</button>
				{#if item.coverUrl}
					<button type="submit" class="btn-secondary justify-center px-5 py-2.5 text-sm">
						Remove cover
					</button>
				{/if}
			</form>
		</div>
	</ModalShell>
{/if}

{#if item.listType === 'wishlist'}
	<form
		bind:this={moveForm}
		method="POST"
		action="/admin/items?/moveToOwned"
		class="hidden"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'failure') {
					toast.error(String(result.data?.message ?? 'Could not move item.'));
				} else {
					toast.success(`Added "${item.title}" to your ${collectionLabel} collection.`);
				}
				await update();
			};
		}}
	>
		<input type="hidden" name="id" value={item.id} />
	</form>

	<ConfirmDialog
		open={showMoveConfirm}
		title="Move to collection?"
		message={`Add "${item.title}" to your ${collectionLabel} collection? It will leave the wishlist.`}
		confirmLabel="Yes move it!"
		cancelLabel="Not yet"
		onCancel={() => (showMoveConfirm = false)}
		onConfirm={() => {
			showMoveConfirm = false;
			moveForm?.requestSubmit();
		}}
	/>
{/if}

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
	onCancel={() => (showDeleteConfirm = false)}
	onConfirm={() => {
		showDeleteConfirm = false;
		deleteForm?.requestSubmit();
	}}
/>
