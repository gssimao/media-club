<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import CoverImage from './CoverImage.svelte';
	import GenreEditor from './GenreEditor.svelte';
	import type { ShowTrackerItemView } from '$lib/server/show-tracker';
	import type { ShowTrackStatus } from '$lib/types/media';
	import { DotsThree, Heart, MonitorPlay, Trash } from 'phosphor-svelte';
	import { toast } from '$lib/stores/toast.svelte';

	interface Props {
		item: ShowTrackerItemView;
		isAdmin?: boolean;
		genreCatalogItems?: { metadata: Record<string, unknown> | null }[];
	}

	let { item, isAdmin = false, genreCatalogItems = [] }: Props = $props();

	let showMenu = $state(false);
	let showWishlistConfirm = $state(false);
	let showOwnedConfirm = $state(false);
	let showDeleteConfirm = $state(false);
	let wishlistForm: HTMLFormElement | undefined = $state();
	let ownedForm: HTMLFormElement | undefined = $state();
	let deleteForm: HTMLFormElement | undefined = $state();
	let cardHovered = $state(false);

	const label = $derived(item.year ? `${item.title} (${item.year})` : item.title);
	const otherStatus = $derived<ShowTrackStatus>(
		item.trackStatus === 'watching' ? 'upcoming' : 'watching'
	);
	const moveLabel = $derived(
		item.trackStatus === 'watching' ? 'Move to coming up' : 'Move to watching now'
	);

	function closeMenu() {
		showMenu = false;
	}
</script>

<article
	id="tracker-item-{item.id}"
	class="group mx-auto flex h-full w-full max-w-[15rem] scroll-mt-32 flex-col items-center transition-[transform,filter] duration-500"
	onmouseenter={() => (cardHovered = true)}
	onmouseleave={() => (cardHovered = false)}
>
	<div class="mb-1 flex min-h-7 w-full shrink-0 items-center justify-between px-0.5">
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
			<button
				type="button"
				class="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-text-secondary))] shadow-sm transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400 {showMenu
					? 'border-amber-500 text-amber-700 dark:text-amber-400'
					: ''}"
				aria-label="Options for {item.title}"
				aria-expanded={showMenu}
				aria-controls="tracker-actions-{item.id}"
				onclick={() => (showMenu = !showMenu)}
			>
				<DotsThree size={16} weight="bold" />
			</button>
		{/if}
	</div>

	<div
		class="bluray-case relative aspect-[2/3] w-full max-w-[13rem] shrink-0 overflow-hidden rounded-sm bg-[rgb(var(--color-surface-raised))] shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl sm:max-w-[15rem]"
	>
		<div class="absolute top-0 right-0 left-0 z-10">
			<div
				class="py-1 text-center text-[8px] font-black tracking-wider text-white uppercase shadow-sm {item.trackStatus ===
				'watching'
					? 'bg-gradient-to-r from-violet-600 to-violet-500'
					: 'bg-gradient-to-r from-amber-600 to-amber-500'}"
			>
				{item.trackStatus === 'watching' ? 'Watching now' : 'Coming up'}
			</div>
		</div>

		<div class="relative h-full w-full overflow-hidden bg-stone-900">
			{#if item.coverUrl}
				<CoverImage
					src={item.coverUrl}
					alt="{label} cover"
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					hovered={cardHovered}
				/>
			{:else}
				<div
					class="flex h-full items-center justify-center bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text-tertiary))]"
				>
					<MonitorPlay size={32} weight="bold" />
				</div>
			{/if}
		</div>

		<div
			class="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-white/20 via-transparent to-white/10"
			aria-hidden="true"
		></div>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-black/30 via-transparent to-black/20"
			aria-hidden="true"
		></div>
	</div>

	<div class="flex min-h-0 w-full flex-1 flex-col">
		<div class="mt-2.5 w-full shrink-0 px-1 text-center">
			<h3
				class="line-clamp-2 min-h-[2.5rem] text-xs leading-snug font-bold text-stone-900 dark:text-amber-50"
			>
				{item.title}
			</h3>
			<p
				class="mt-0.5 line-clamp-1 min-h-[1.125rem] text-[11px] font-medium text-stone-600 dark:text-stone-400"
			>
				{item.subtitle ?? ''}
			</p>
		</div>

		<GenreEditor
			item={{ id: item.id, metadata: item.metadata, title: item.title }}
			action="?/updateGenres"
			{isAdmin}
			category="show"
			catalogItems={genreCatalogItems}
		/>

		{#if item.notes}
			<p
				class="mt-1 line-clamp-2 shrink-0 px-1 text-center text-[10px] font-medium text-stone-600 italic dark:text-stone-400"
			>
				{item.notes}
			</p>
		{/if}

		<div class="min-h-0 flex-1" aria-hidden="true"></div>

		{#if isAdmin && showMenu}
			<div id="tracker-actions-{item.id}" class="mt-3 w-full shrink-0 space-y-2">
				<form
					method="POST"
					action="?/setTrackStatus"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'failure') {
								toast.error(String(result.data?.message ?? 'Could not move show.'));
							} else {
								toast.success(
									`Moved "${item.title}" to ${otherStatus === 'watching' ? 'watching now' : 'coming up'}.`
								);
							}
							closeMenu();
							await update();
						};
					}}
				>
					<input type="hidden" name="id" value={item.id} />
					<input type="hidden" name="trackStatus" value={otherStatus} />
					<button
						type="submit"
						class="btn-secondary inline-flex w-full justify-center gap-1 px-2.5 py-1.5 text-[10px]"
					>
						{moveLabel}
					</button>
				</form>

				<button
					type="button"
					class="btn-secondary inline-flex w-full justify-center gap-1 px-2.5 py-1.5 text-[10px]"
					onclick={() => {
						closeMenu();
						showWishlistConfirm = true;
					}}
				>
					<Heart size={11} weight="bold" />
					Add to wishlist
				</button>

				<button
					type="button"
					class="btn-primary inline-flex w-full justify-center gap-1 px-2.5 py-1.5 text-[10px]"
					onclick={() => {
						closeMenu();
						showOwnedConfirm = true;
					}}
				>
					<MonitorPlay size={11} weight="bold" />
					Add to collection
				</button>

				<button
					type="button"
					class="inline-flex w-full items-center justify-center gap-1 rounded-full border border-red-400/80 px-2.5 py-1.5 text-[10px] font-bold text-red-700 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
					onclick={() => {
						closeMenu();
						showDeleteConfirm = true;
					}}
				>
					<Trash size={11} weight="bold" />
					Remove from tracker
				</button>
			</div>
		{/if}
	</div>
</article>

<form
	bind:this={wishlistForm}
	method="POST"
	action="?/promoteToWishlist"
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				toast.error(String(result.data?.message ?? 'Could not add to wishlist.'));
			} else {
				toast.success(`Added "${item.title}" to the wishlist.`);
			}
			showWishlistConfirm = false;
			await update();
		};
	}}
>
	<input type="hidden" name="id" value={item.id} />
</form>

<form
	bind:this={ownedForm}
	method="POST"
	action="?/promoteToOwned"
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				toast.error(String(result.data?.message ?? 'Could not add to collection.'));
			} else {
				toast.success(`Added "${item.title}" to the collection.`);
			}
			showOwnedConfirm = false;
			await update();
		};
	}}
>
	<input type="hidden" name="id" value={item.id} />
</form>

<form
	bind:this={deleteForm}
	method="POST"
	action="?/deleteItem"
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				toast.error(String(result.data?.message ?? 'Could not remove show.'));
			} else {
				toast.success(`Removed "${item.title}" from the tracker.`);
			}
			showDeleteConfirm = false;
			await update();
		};
	}}
>
	<input type="hidden" name="id" value={item.id} />
</form>

<ConfirmDialog
	open={showWishlistConfirm}
	title="Add to wishlist?"
	message={`Add "${item.title}" to your show wishlist? It stays on the tracker until you remove it.`}
	confirmLabel="Add to wishlist"
	cancelLabel="Cancel"
	onCancel={() => (showWishlistConfirm = false)}
	onConfirm={() => wishlistForm?.requestSubmit()}
/>

<ConfirmDialog
	open={showOwnedConfirm}
	title="Add to collection?"
	message={`Add "${item.title}" to your show collection? It stays on the tracker until you remove it.`}
	confirmLabel="Add to collection"
	cancelLabel="Cancel"
	onCancel={() => (showOwnedConfirm = false)}
	onConfirm={() => ownedForm?.requestSubmit()}
/>

<ConfirmDialog
	open={showDeleteConfirm}
	title="Remove from tracker?"
	message={`Remove "${item.title}" from the show tracker?`}
	confirmLabel="Remove"
	cancelLabel="Cancel"
	variant="danger"
	onCancel={() => (showDeleteConfirm = false)}
	onConfirm={() => deleteForm?.requestSubmit()}
/>

<style>
	.bluray-case {
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.1),
			0 4px 8px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.group:hover .bluray-case {
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.15),
			0 8px 16px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}
</style>
