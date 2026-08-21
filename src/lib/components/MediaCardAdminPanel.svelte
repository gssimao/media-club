<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import AssignAlbumControl from './AssignAlbumControl.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import CoverSearchPicker from './CoverSearchPicker.svelte';
	import {
		CATEGORY_ACTION_WORDING,
		CATEGORY_LABELS,
		type Album,
		type MediaItem
	} from '$lib/types/media';
	import { getDisplayNotes } from '$lib/utils/format-tags';
	import { Check, Eye, EyeSlash, Image, PencilSimple, Trash } from 'phosphor-svelte';
	import { toast } from '$lib/stores/toast.svelte';

	interface Props {
		item: MediaItem;
		albums: Album[];
		showAlbumWatchedToggle: boolean;
		showAdminMenu: boolean;
		onCloseMenu: () => void;
		onDeleteConfirm: () => void;
		showDeleteConfirm: boolean;
		onCancelDelete: () => void;
		onConfirmDelete: () => void;
		deleteForm: HTMLFormElement | undefined;
	}

	let {
		item,
		albums,
		showAlbumWatchedToggle,
		showAdminMenu,
		onCloseMenu,
		onDeleteConfirm,
		showDeleteConfirm,
		onCancelDelete,
		onConfirmDelete,
		deleteForm = $bindable()
	}: Props = $props();

	const wording = $derived(CATEGORY_ACTION_WORDING[item.category]);
	const collectionLabel = $derived(CATEGORY_LABELS[item.category]);
	const displayNotes = $derived(getDisplayNotes(item));

	let editingNotes = $state(false);
	let editingCover = $state(false);
	let pendingCoverUrl = $state<string | null>(null);
	let pendingCoverMetadata = $state<string>('');
	let coverForm: HTMLFormElement | undefined = $state();
	let moveForm: HTMLFormElement | undefined = $state();
	let showMoveConfirm = $state(false);

	function openNotesEditor() {
		onCloseMenu();
		editingNotes = true;
	}

	function openCoverEditor() {
		onCloseMenu();
		editingCover = true;
	}

	function handleCoverSelect(coverUrl: string, metadata?: Record<string, unknown>) {
		pendingCoverUrl = coverUrl;
		pendingCoverMetadata = metadata ? JSON.stringify(metadata) : '';
		void tick().then(() => coverForm?.requestSubmit());
	}
</script>

{#if item.listType === 'owned' && albums.length > 0}
	<AssignAlbumControl itemId={item.id} albumId={item.albumId} {albums} />
{/if}

{#if showAlbumWatchedToggle}
	<div class="mt-2 min-h-[2rem] w-full">
		{#if item.albumId}
			<form method="POST" action="/admin/items?/toggleAlbumWatched" class="w-full" use:enhance>
				<input type="hidden" name="id" value={item.id} />
				<input type="hidden" name="watched" value={item.albumWatchedAt ? 'false' : 'true'} />
				<button
					type="submit"
					class="btn-secondary inline-flex w-full justify-center gap-1 px-2.5 py-1.5 text-[10px]"
				>
					{#if item.albumWatchedAt}
						<EyeSlash size={11} weight="bold" />
						Mark {wording.notDone}
					{:else}
						<Eye size={11} weight="bold" />
						Mark {wording.done}
					{/if}
				</button>
			</form>
		{/if}
	</div>
{/if}

<div class="mt-2 min-h-[3.25rem] w-full">
	{#if displayNotes}
		<p
			class="line-clamp-2 w-full rounded-[2rem] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 text-center text-[10px] text-[rgb(var(--color-text-secondary))]"
		>
			{displayNotes}
		</p>
	{/if}
</div>

<div id="item-actions-{item.id}" class="mt-2 w-full space-y-2">
	{#if showAdminMenu && !editingNotes && !editingCover}
		{#if item.listType === 'wishlist'}
			<button
				type="button"
				class="btn-primary w-full justify-center px-3 py-1.5 text-[10px]"
				onclick={() => (showMoveConfirm = true)}
			>
				<Check size={12} weight="bold" />
				Move to Collection
			</button>

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
					onCloseMenu();
					moveForm?.requestSubmit();
				}}
			/>
		{/if}

		<button
			type="button"
			onclick={openNotesEditor}
			class="btn-secondary inline-flex w-full justify-center px-2.5 py-1.5 text-[10px]"
		>
			<PencilSimple size={11} weight="bold" />
			Notes
		</button>

		{#if item.category === 'movie'}
			<button
				type="button"
				onclick={openCoverEditor}
				class="btn-secondary inline-flex w-full justify-center px-2.5 py-1.5 text-[10px]"
			>
				<Image size={11} weight="bold" />
				Change cover
			</button>
		{/if}

		<button
			type="button"
			onclick={() => {
				onCloseMenu();
				onDeleteConfirm();
			}}
			class="inline-flex w-full items-center justify-center gap-1 rounded-full border border-red-400/80 px-2.5 py-1.5 text-[10px] font-bold text-red-700 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
		>
			<Trash size={11} weight="bold" />
			Delete item
		</button>
	{/if}

	{#if item.category === 'movie' && editingCover}
		<div class="surface-round space-y-2 p-3">
			<CoverSearchPicker category="movie" onSelect={handleCoverSelect} />
			<form
				bind:this={coverForm}
				method="POST"
				action="/admin/items?/updateCover"
				class="hidden"
				use:enhance={() => {
					return async ({ update }) => {
						editingCover = false;
						pendingCoverUrl = null;
						pendingCoverMetadata = '';
						await update();
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
				use:enhance={() => {
					return async ({ update }) => {
						editingCover = false;
						await update();
					};
				}}
			>
				<input type="hidden" name="id" value={item.id} />
				<input type="hidden" name="coverUrl" value="" />
				<button type="submit" class="btn-secondary w-full justify-center px-3 py-1.5 text-[10px]">
					Remove cover
				</button>
			</form>
			<button
				type="button"
				onclick={() => (editingCover = false)}
				class="btn-secondary w-full justify-center px-3 py-1.5 text-[10px]"
			>
				Cancel
			</button>
		</div>
	{/if}

	{#if editingNotes}
		<form
			method="POST"
			action="/admin/items?/updateNotes"
			class="surface-round space-y-2 p-3"
			use:enhance={() => {
				return async ({ update }) => {
					editingNotes = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={item.id} />
			<textarea
				name="notes"
				rows="2"
				aria-label="Notes for {item.title}"
				class="w-full rounded-[2rem] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] px-3 py-2 text-[10px] text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:border-amber-400 focus:outline-none"
				placeholder="Edition, condition, personal notes…">{item.notes ?? ''}</textarea
			>
			<div class="flex gap-2">
				<button type="submit" class="btn-primary flex-1 justify-center px-3 py-1.5 text-[10px]">
					Save
				</button>
				<button
					type="button"
					onclick={() => (editingNotes = false)}
					class="btn-secondary flex-1 justify-center px-3 py-1.5 text-[10px]"
				>
					Cancel
				</button>
			</div>
		</form>
	{/if}
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
