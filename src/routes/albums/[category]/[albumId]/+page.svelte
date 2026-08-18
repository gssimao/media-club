<script lang="ts">
	import { enhance } from '$app/forms';
	import PageShell from '$lib/components/PageShell.svelte';
	import AlbumEditForm from '$lib/components/AlbumEditForm.svelte';
	import AlbumSleeve from '$lib/components/AlbumSleeve.svelte';
	import AlbumRandomPicker from '$lib/components/AlbumRandomPicker.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import { type AlbumAccentColor } from '$lib/theme/album-colors';
	import { CATEGORY_ACTION_WORDING, CATEGORY_PATHS, type MediaItem } from '$lib/types/media';
	import { PencilSimple, Trash } from 'phosphor-svelte';

	let { data } = $props();

	const categoryPath = $derived(CATEGORY_PATHS[data.category]);
	const wording = $derived(CATEGORY_ACTION_WORDING[data.category]);
	const itemCount = $derived(data.items.length);

	const unwatchedItems = $derived(data.items.filter((item) => !item.albumWatchedAt));
	const watchedItems = $derived(data.items.filter((item) => item.albumWatchedAt));

	let highlightedId = $state<string | null>(null);
	let editingAlbum = $state(false);
	let showDeleteConfirm = $state(false);
	let deleteForm: HTMLFormElement | undefined = $state();
	let titleDraft = $state('');
	let descriptionDraft = $state('');
	let coverUrlDraft = $state('');
	let accentColorDraft = $state<AlbumAccentColor | null>(null);

	$effect(() => {
		titleDraft = data.album.title;
		descriptionDraft = data.album.description ?? '';
		coverUrlDraft = data.album.coverUrl ?? '';
		accentColorDraft = data.album.accentColor;
	});

	const isDirty = $derived(
		titleDraft.trim() !== data.album.title ||
			descriptionDraft.trim() !== (data.album.description ?? '') ||
			coverUrlDraft.trim() !== (data.album.coverUrl ?? '') ||
			accentColorDraft !== data.album.accentColor
	);

	const itemFallbackCover = $derived(data.items.find((item) => item.coverUrl)?.coverUrl ?? null);
	const previewDisplayCover = $derived(
		coverUrlDraft.trim() ? coverUrlDraft.trim() : itemFallbackCover
	);
	const previewAlbum = $derived({
		...data.album,
		accentColor: accentColorDraft
	});

	function resetDrafts() {
		titleDraft = data.album.title;
		descriptionDraft = data.album.description ?? '';
		coverUrlDraft = data.album.coverUrl ?? '';
		accentColorDraft = data.album.accentColor;
	}

	function toggleEditAlbum() {
		if (editingAlbum && isDirty && !confirm('Discard unsaved album changes?')) {
			return;
		}
		editingAlbum = !editingAlbum;
		if (!editingAlbum) resetDrafts();
	}

	function closeEditAlbum() {
		if (isDirty && !confirm('Discard unsaved album changes?')) {
			return;
		}
		editingAlbum = false;
		resetDrafts();
	}

	function handlePick(item: MediaItem) {
		highlightedId = item.id;
		requestAnimationFrame(() => {
			document.getElementById(`item-${item.id}`)?.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		});
	}

	function handleCoverSelect(coverUrl: string) {
		coverUrlDraft = coverUrl;
	}

	function clearCover() {
		coverUrlDraft = '';
	}
</script>

<svelte:head>
	<title>{data.album.title} · Media Club</title>
</svelte:head>

<PageShell title={data.album.title} description={data.album.description ?? undefined}>
	{#snippet controls()}
		<NavLink href="/albums/{data.category}" variant="accent">All {data.label} albums</NavLink>
		<NavLink href="/{categoryPath}">Back to {data.label}</NavLink>

		<AlbumRandomPicker
			{unwatchedItems}
			category={data.category}
			isAdmin={data.isAdmin}
			onPick={handlePick}
		/>
	{/snippet}

	<div class="mb-8 flex justify-center">
		<div class="flex items-start gap-3">
			<div class="w-full max-w-xs">
				<AlbumSleeve
					album={data.isAdmin && editingAlbum ? previewAlbum : data.album}
					displayCoverUrl={data.isAdmin && editingAlbum
						? previewDisplayCover
						: data.displayCoverUrl}
				/>
			</div>

			{#if data.isAdmin}
				<div class="flex shrink-0 flex-col gap-2 pt-3">
					<button
						type="button"
						class="inline-flex size-9 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-text-secondary))] shadow-sm transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400 {editingAlbum
							? 'border-amber-500 text-amber-700 dark:text-amber-400'
							: ''}"
						aria-label={editingAlbum ? 'Close album editor' : 'Edit album'}
						aria-expanded={editingAlbum}
						aria-controls="album-edit-panel"
						onclick={toggleEditAlbum}
					>
						<PencilSimple size={16} weight="bold" />
					</button>
					<button
						type="button"
						class="inline-flex size-9 items-center justify-center rounded-full border border-red-400/80 bg-[rgb(var(--color-surface-raised))] text-red-700 shadow-sm transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
						aria-label="Delete album"
						onclick={() => (showDeleteConfirm = true)}
					>
						<Trash size={15} weight="bold" />
					</button>
				</div>

				<form
					bind:this={deleteForm}
					method="POST"
					action="/admin/albums?/deleteAlbum"
					class="hidden"
					use:enhance
				>
					<input type="hidden" name="id" value={data.album.id} />
				</form>

				<ConfirmDialog
					open={showDeleteConfirm}
					title="Delete album?"
					message={`Delete "${data.album.title}"? ${itemCount === 0 ? 'This album is empty.' : itemCount === 1 ? 'Its item will return to the main collection list.' : `All ${itemCount} items will return to the main collection list.`}`}
					confirmLabel="Delete album"
					cancelLabel="Keep album"
					variant="danger"
					onCancel={() => (showDeleteConfirm = false)}
					onConfirm={() => {
						showDeleteConfirm = false;
						deleteForm?.requestSubmit();
					}}
				/>
			{/if}
		</div>
	</div>

	{#if data.isAdmin && editingAlbum}
		<div id="album-edit-panel">
			<AlbumEditForm
				albumId={data.album.id}
				category={data.category}
				bind:titleDraft
				bind:descriptionDraft
				bind:coverUrlDraft
				bind:accentColorDraft
				{isDirty}
				onCoverSelect={handleCoverSelect}
				onClearCover={clearCover}
				onSaved={() => {
					editingAlbum = false;
				}}
				onCancel={closeEditAlbum}
			/>
		</div>
	{/if}

	<MediaGrid
		items={unwatchedItems}
		isAdmin={data.isAdmin}
		albums={[data.album]}
		sectionTitle="To {wording.verb}"
		{highlightedId}
		showAlbumWatchedToggle={data.isAdmin}
		emptyTitle="Nothing left to {wording.verb}"
		emptyDescription={watchedItems.length > 0
			? `Every item in this album has been marked ${wording.done}. Use Mark ${wording.notDone} on a card to add it back to the pool.`
			: `Assign items from the ${data.label.toLowerCase()} collection using the album dropdown on each card.`}
	/>

	{#if watchedItems.length > 0}
		<div class="mt-12">
			<MediaGrid
				items={watchedItems}
				isAdmin={data.isAdmin}
				albums={[data.album]}
				sectionTitle="Already {wording.done}"
				{highlightedId}
				showAlbumWatchedToggle={data.isAdmin}
				showSearch={false}
				emptyTitle=""
				emptyDescription=""
			/>
		</div>
	{/if}
</PageShell>
