<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import AssignAlbumControl from './AssignAlbumControl.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import CoverSearchPicker from './CoverSearchPicker.svelte';
	import { CATEGORY_ACTION_WORDING, CATEGORY_LABELS, type Album, type MediaItem } from '$lib/types/media';
	import {
		FORMAT_TAG_PRESETS,
		getDisplayNotes,
		getDisplayTags,
		toggleTag
	} from '$lib/utils/format-tags';
	import { Check, DotsThree, Eye, EyeSlash, Image, PencilSimple, Trash } from 'phosphor-svelte';
	import { toast } from '$lib/stores/toast.svelte';

	interface Props {
		item: MediaItem;
		isAdmin: boolean;
		albums?: Album[];
		highlighted?: boolean;
		showAlbumWatchedToggle?: boolean;
	}

	let {
		item,
		isAdmin,
		albums = [],
		highlighted = false,
		showAlbumWatchedToggle = false
	}: Props = $props();

	const label = $derived(item.year ? `${item.title} (${item.year})` : item.title);
	const displayTags = $derived(getDisplayTags(item));
	const displayNotes = $derived(getDisplayNotes(item));
	const presetTags = $derived(FORMAT_TAG_PRESETS[item.category]);
	const wording = $derived(CATEGORY_ACTION_WORDING[item.category]);
	const collectionLabel = $derived(CATEGORY_LABELS[item.category]);

	let editingNotes = $state(false);
	let editingCover = $state(false);
	let pendingCoverUrl = $state<string | null>(null);
	let pendingCoverMetadata = $state<string>('');
	let coverForm: HTMLFormElement | undefined = $state();
	let deleteForm: HTMLFormElement | undefined = $state();
	let moveForm: HTMLFormElement | undefined = $state();
	let showDeleteConfirm = $state(false);
	let showMoveConfirm = $state(false);
	let showAdminMenu = $state(false);

	function toggleAdminMenu() {
		showAdminMenu = !showAdminMenu;
	}

	function openNotesEditor() {
		showAdminMenu = false;
		editingNotes = true;
	}

	function openCoverEditor() {
		showAdminMenu = false;
		editingCover = true;
	}

	function handleCoverSelect(coverUrl: string, metadata?: Record<string, unknown>) {
		pendingCoverUrl = coverUrl;
		pendingCoverMetadata = metadata ? JSON.stringify(metadata) : '';
		void tick().then(() => coverForm?.requestSubmit());
	}
</script>

<article
	id="item-{item.id}"
	class="group mx-auto flex w-full max-w-[15rem] scroll-mt-32 flex-col items-center transition-[transform,filter] duration-500 {highlighted
		? 'scale-105'
		: ''}"
>
	<!-- Year + delete — outside the circle -->
	<div class="mb-1 flex min-h-7 w-full items-center justify-between px-0.5">
		{#if item.year}
			<span
				class="text-xs font-black tracking-widest text-amber-700 tabular-nums dark:text-amber-400"
			>
				{item.year}
			</span>
		{:else}
			<span aria-hidden="true"></span>
		{/if}

		{#if isAdmin}
			<div class="flex items-center gap-1">
				<button
					type="button"
					class="inline-flex size-7 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-text-secondary))] shadow-sm transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400 {showAdminMenu
						? 'border-amber-500 text-amber-700 dark:text-amber-400'
						: ''}"
					aria-label="Item options for {item.title}"
					aria-expanded={showAdminMenu}
					aria-controls="item-actions-{item.id}"
					onclick={toggleAdminMenu}
				>
					<DotsThree size={16} weight="bold" />
				</button>
				<button
					type="button"
					class="inline-flex size-7 items-center justify-center rounded-full border border-red-400/80 bg-[rgb(var(--color-surface-raised))] text-red-700 shadow-sm transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
					aria-label="Delete {item.title}"
					onclick={() => (showDeleteConfirm = true)}
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
				onCancel={() => (showDeleteConfirm = false)}
				onConfirm={() => {
					showDeleteConfirm = false;
					deleteForm?.requestSubmit();
				}}
			/>
		{/if}
	</div>

	<!-- Simple circle frame — cover only inside. Fluid width so 2-col phone grids never clip the disc. -->
	<div
		class="media-disc relative aspect-square w-full max-w-[13rem] overflow-hidden rounded-full border-2 bg-[rgb(var(--color-surface-raised))] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md sm:max-w-[15rem] {highlighted
			? 'border-amber-400 ring-4 ring-amber-400/60 ring-offset-2 ring-offset-[rgb(var(--color-bg))]'
			: ''} {item.listType === 'wishlist'
			? 'border-dashed border-amber-500 dark:border-amber-500'
			: highlighted
				? ''
				: 'border-amber-500/45 dark:border-amber-500/35'}"
	>
		{#if item.listType === 'wishlist'}
			<div
				class="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-amber-400 px-2.5 py-0.5 text-[9px] font-black tracking-wide text-stone-900 uppercase"
			>
				Wishlist
			</div>
		{/if}

		<!-- Record grooves — spin like a turntable while hovered -->
		<svg
			class="pointer-events-none absolute inset-0 size-full text-amber-500 dark:text-amber-400"
			viewBox="0 0 100 100"
			aria-hidden="true"
		>
			<g class="disc-grooves">
				{#each [47, 44, 41] as radius (radius)}
					<circle
						cx="50"
						cy="50"
						r={radius}
						fill="none"
						stroke="currentColor"
						stroke-width="0.5"
						opacity="0.35"
					/>
				{/each}
				{#each Array.from({ length: 12 }, (_, i) => i * 30) as angle (angle)}
					<line
						x1="50"
						y1="2.5"
						x2="50"
						y2="7"
						stroke="currentColor"
						stroke-width="1"
						opacity="0.45"
						transform="rotate({angle} 50 50)"
					/>
				{/each}
			</g>
		</svg>

		<div class="absolute inset-0 flex items-center justify-center">
			<div
				class="aspect-[2/3] w-[58%] overflow-hidden rounded-[1.5rem] bg-[rgb(var(--color-bg))] dark:bg-stone-900"
			>
				{#if item.coverUrl}
					<img
						src={item.coverUrl}
						alt="{label} cover"
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
				{:else}
					<div
						class="flex h-full items-center justify-center px-2 text-center text-[10px] font-semibold text-[rgb(var(--color-text-tertiary))] dark:text-stone-500"
					>
						No cover
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Title + subtitle — below circle -->
	<div class="mt-2.5 w-full px-1 text-center">
		<h2 class="line-clamp-2 text-xs leading-snug font-bold text-stone-900 dark:text-amber-50">
			{item.title}
		</h2>
		{#if item.subtitle}
			<p class="mt-0.5 line-clamp-1 text-[11px] font-medium text-stone-600 dark:text-stone-400">
				{item.subtitle}
			</p>
		{/if}
	</div>

	<!-- Format tags — below title, outside circle -->
	{#if isAdmin || displayTags.length > 0}
		<div class="mt-2 flex w-full flex-wrap justify-center gap-1 px-1">
			{#if isAdmin}
				{#each presetTags as tag (tag)}
					{@const active = displayTags.includes(tag)}
					<form method="POST" action="/admin/items?/updateTags" use:enhance>
						<input type="hidden" name="id" value={item.id} />
						<input type="hidden" name="tags" value={JSON.stringify(toggleTag(displayTags, tag))} />
						<button
							type="submit"
							class="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase transition-colors {active
								? 'bg-amber-400 text-stone-900'
								: 'border border-dashed border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400'}"
						>
							{tag}
						</button>
					</form>
				{/each}
			{:else}
				{#each displayTags as tag (tag)}
					<span
						class="rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold tracking-wide text-stone-900 uppercase"
					>
						{tag}
					</span>
				{/each}
			{/if}
		</div>
	{/if}

	{#if isAdmin && item.listType === 'owned' && albums.length > 0}
		<AssignAlbumControl itemId={item.id} albumId={item.albumId} {albums} />
	{/if}

	{#if isAdmin && showAlbumWatchedToggle && item.albumId}
		<form method="POST" action="/admin/items?/toggleAlbumWatched" class="mt-2 w-full" use:enhance>
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

	{#if displayNotes}
		<p
			class="mt-2 line-clamp-2 w-full rounded-[2rem] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 text-center text-[10px] text-[rgb(var(--color-text-secondary))]"
		>
			{displayNotes}
		</p>
	{/if}

	{#if isAdmin}
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
							showAdminMenu = false;
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
	{/if}
</article>

<style>
	@keyframes disc-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.disc-grooves {
		transform-box: fill-box;
		transform-origin: center;
	}

	article:hover .media-disc .disc-grooves {
		animation: disc-spin 5s linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		article:hover .media-disc .disc-grooves {
			animation: none;
		}
	}

	:global([data-motion='reduced']) article:hover .media-disc .disc-grooves {
		animation: none;
	}
</style>
