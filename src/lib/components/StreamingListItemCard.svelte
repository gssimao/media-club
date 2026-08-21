<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { DotsThree, FilmStrip, Heart } from 'phosphor-svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { StreamingListItemView } from '$lib/server/streaming-lists';

	interface Props {
		item: StreamingListItemView;
	}

	let { item }: Props = $props();

	let showMenu = $state(false);
	let showWishlistConfirm = $state(false);
	let showOwnedConfirm = $state(false);
	let wishlistForm: HTMLFormElement | undefined = $state();
	let ownedForm: HTMLFormElement | undefined = $state();

	const label = $derived(item.year ? `${item.title} (${item.year})` : item.title);

	function closeMenu() {
		showMenu = false;
	}
</script>

<article
	id="streaming-item-{item.id}"
	class="group mx-auto flex w-full max-w-[15rem] scroll-mt-32 flex-col items-center transition-[transform,filter] duration-500"
>
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

		<button
			type="button"
			class="inline-flex size-7 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-text-secondary))] shadow-sm transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400 {showMenu
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
		class="media-disc relative aspect-square w-full max-w-[13rem] overflow-hidden rounded-full border-2 border-dashed border-sky-500/70 bg-[rgb(var(--color-surface-raised))] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md sm:max-w-[15rem] dark:border-sky-400/60"
	>
		{#if item.coverUrl}
			<img src={item.coverUrl} alt="" class="h-full w-full object-cover" loading="lazy" />
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

	<h3
		class="mt-2 line-clamp-2 w-full px-1 text-center text-xs leading-snug font-bold text-[rgb(var(--color-text))]"
	>
		{label}
	</h3>

	{#if showMenu}
		<div id="streaming-actions-{item.id}" class="mt-2 w-full space-y-2">
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
