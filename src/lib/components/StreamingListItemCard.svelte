<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import CoverImage from './CoverImage.svelte';
	import GenreEditor from './GenreEditor.svelte';
	import StreamingProviders from './StreamingProviders.svelte';
	import { DotsThree, FilmStrip, Heart, Trash } from 'phosphor-svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { StreamingListItemView } from '$lib/server/streaming-lists';
	import type { MovieWatchProviders } from '$lib/types/tmdb';

	interface Props {
		item: StreamingListItemView;
		watchProviders?: MovieWatchProviders | null;
		isAdmin?: boolean;
	}

	let { item, watchProviders = undefined, isAdmin = false }: Props = $props();

	let showMenu = $state(false);
	let showWishlistConfirm = $state(false);
	let showOwnedConfirm = $state(false);
	let showDeleteConfirm = $state(false);
	let wishlistForm: HTMLFormElement | undefined = $state();
	let ownedForm: HTMLFormElement | undefined = $state();
	let deleteForm: HTMLFormElement | undefined = $state();
	let cardHovered = $state(false);

	const label = $derived(item.year ? `${item.title} (${item.year})` : item.title);

	function closeMenu() {
		showMenu = false;
	}
</script>

<article
	id="streaming-item-{item.id}"
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

		<button
			type="button"
			class="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-text-secondary))] shadow-sm transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400 {showMenu
				? 'border-amber-500 text-amber-700 dark:text-amber-400'
				: ''}"
			aria-label="Options for {item.title}"
			aria-expanded={showMenu}
			aria-controls="streaming-actions-{item.id}"
			onclick={() => (showMenu = !showMenu)}
		>
			<DotsThree size={16} weight="bold" />
		</button>
	</div>

	<div
		class="media-disc relative aspect-square w-full max-w-[13rem] shrink-0 overflow-hidden rounded-full border-2 border-dashed border-sky-500/70 bg-[rgb(var(--color-surface-raised))] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md sm:max-w-[15rem] dark:border-sky-400/60"
	>
		{#if item.coverUrl}
			<CoverImage
				src={item.coverUrl}
				alt=""
				class="h-full w-full object-cover"
				hovered={cardHovered}
			/>
		{:else}
			<div
				class="flex h-full w-full items-center justify-center bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text-tertiary))]"
			>
				<FilmStrip size={32} weight="bold" />
			</div>
		{/if}
		<span
			class="absolute top-2 right-2 rounded-full bg-sky-500/90 px-2 py-0.5 text-[8px] font-black tracking-wide text-white uppercase"
		>
			Stream
		</span>
	</div>

	<div class="flex min-h-0 w-full flex-1 flex-col">
		<h3
			class="mt-2 line-clamp-2 min-h-[2.5rem] w-full shrink-0 px-1 text-center text-xs leading-snug font-bold text-[rgb(var(--color-text))]"
		>
			{label}
		</h3>

		<StreamingProviders providers={watchProviders} />

		<div class="flex min-h-0 w-full flex-1 flex-col {isAdmin ? '' : 'mt-1.5'}">
			<GenreEditor
				item={{ id: item.id, metadata: item.metadata }}
				action="?/updateGenres"
				{isAdmin}
				variant="sky"
			/>
		</div>
	</div>

	{#if showMenu}
		<div id="streaming-actions-{item.id}" class="mt-2 w-full shrink-0 space-y-2">
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
				<FilmStrip size={11} weight="bold" />
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
				Remove from list
			</button>
		</div>
	{/if}
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
				toast.error(String(result.data?.message ?? 'Could not remove item.'));
			} else {
				toast.success(`Removed "${item.title}" from this list.`);
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
	message={`Move "${item.title}" to your wishlist? It will leave this streaming list.`}
	confirmLabel="Add to wishlist"
	cancelLabel="Cancel"
	onCancel={() => (showWishlistConfirm = false)}
	onConfirm={() => wishlistForm?.requestSubmit()}
/>

<ConfirmDialog
	open={showOwnedConfirm}
	title="Add to collection?"
	message={`Move "${item.title}" to your movie collection? It will leave this streaming list.`}
	confirmLabel="Add to collection"
	cancelLabel="Cancel"
	onCancel={() => (showOwnedConfirm = false)}
	onConfirm={() => ownedForm?.requestSubmit()}
/>

<ConfirmDialog
	open={showDeleteConfirm}
	title="Remove from list?"
	message={`Remove "${item.title}" from this streaming list?`}
	confirmLabel="Remove"
	cancelLabel="Cancel"
	variant="danger"
	onCancel={() => (showDeleteConfirm = false)}
	onConfirm={() => deleteForm?.requestSubmit()}
/>
