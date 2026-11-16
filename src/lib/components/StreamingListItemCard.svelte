<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import PosterCover from './PosterCover.svelte';
	import CoverTools from './CoverTools.svelte';
	import GenreEditor from './GenreEditor.svelte';
	import StreamingProviders from './StreamingProviders.svelte';
	import CardOptionsMenu, { type CardMenuAction } from './CardOptionsMenu.svelte';
	import { FilmStrip, Heart, Trash, Eye, EyeSlash } from 'phosphor-svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { StreamingListItemView } from '$lib/server/streaming-lists';
	import type { MovieWatchProviders } from '$lib/types/tmdb';

	interface Props {
		item: StreamingListItemView;
		watchProviders?: MovieWatchProviders | null;
		isAdmin?: boolean;
		genreCatalogItems?: { metadata: Record<string, unknown> | null }[];
	}

	let {
		item,
		watchProviders = undefined,
		isAdmin = false,
		genreCatalogItems = []
	}: Props = $props();

	let showMenu = $state(false);
	let showWishlistConfirm = $state(false);
	let showOwnedConfirm = $state(false);
	let showDeleteConfirm = $state(false);
	let wishlistForm: HTMLFormElement | undefined = $state();
	let ownedForm: HTMLFormElement | undefined = $state();
	let deleteForm: HTMLFormElement | undefined = $state();
	let cardHovered = $state(false);

	const label = $derived(item.year ? `${item.title} (${item.year})` : item.title);

	type StreamingAction = 'wishlist' | 'owned' | 'delete';

	const menuActions: CardMenuAction<StreamingAction>[] = [
		{ id: 'owned', label: 'Add to owned movies', icon: FilmStrip, tone: 'accent' },
		{ id: 'wishlist', label: 'Add to wishlist', icon: Heart },
		{ id: 'delete', label: 'Remove from list', icon: Trash, tone: 'danger' }
	];

	function runAction(action: StreamingAction) {
		if (action === 'wishlist') showWishlistConfirm = true;
		else if (action === 'owned') showOwnedConfirm = true;
		else showDeleteConfirm = true;
	}
</script>

<article
	id="streaming-item-{item.id}"
	class="group mx-auto flex h-full w-full max-w-[15rem] scroll-mt-32 flex-col items-center transition-[transform,filter] duration-500 {showMenu
		? 'relative z-20'
		: ''}"
	onmouseenter={() => (cardHovered = true)}
	onmouseleave={() => (cardHovered = false)}
>
	<div class="mb-1 flex min-h-7 w-full shrink-0 items-center justify-between px-0.5">
		{#if item.year}
			<span class="text-xs font-medium text-[rgb(var(--color-text-tertiary))] tabular-nums">
				{item.year}
			</span>
		{:else}
			<span aria-hidden="true"></span>
		{/if}

		{#if isAdmin}
			<CardOptionsMenu
				menuId="streaming-actions-{item.id}"
				triggerLabel="Options for {item.title}"
				subject={item.title}
				actions={menuActions}
				bind:open={showMenu}
				onSelect={runAction}
			/>
		{/if}
	</div>

	<PosterCover title={label} coverUrl={item.coverUrl} hovered={cardHovered} format="Streaming">
		{#snippet children(open)}
			<CoverTools {open}>
				<div class="cover-tools__genres">
					<GenreEditor
						item={{ id: item.id, metadata: item.metadata, title: item.title }}
						action="?/updateGenres"
						{isAdmin}
						catalogItems={genreCatalogItems}
					/>
				</div>
				{#if isAdmin}
					<form
						method="POST"
						action="?/toggleWatched"
						use:enhance={() =>
							async ({ result, update }) => {
								if (result.type === 'failure' || result.type === 'error')
									toast.error('Could not update watched status.');
								await update({ reset: false });
							}}
					>
						<input type="hidden" name="id" value={item.id} /><input
							type="hidden"
							name="watched"
							value={item.watchedAt ? 'false' : 'true'}
						/>
						<button
							class="inline-flex min-h-11 items-center gap-1 rounded-full bg-white/15 px-3 text-xs text-white"
							type="submit"
							>{#if item.watchedAt}<EyeSlash size={14} />Mark unwatched{:else}<Eye size={14} />Mark
								watched{/if}</button
						>
					</form>
				{/if}
			</CoverTools>
		{/snippet}
	</PosterCover>
	<div class="mt-2.5 flex w-full flex-1 flex-col px-1 text-center">
		<h3
			class="line-clamp-2 min-h-[2.5rem] text-sm leading-snug font-medium text-[rgb(var(--color-text))]"
		>
			{item.title}
		</h3>
		<p
			class="mt-0.5 line-clamp-1 min-h-[1.125rem] text-[11px] text-[rgb(var(--color-text-secondary))]"
		>
			{item.subtitle ?? ''}
		</p>
		<StreamingProviders providers={watchProviders} />
	</div>
</article>

<form
	bind:this={wishlistForm}
	method="POST"
	action="?/promoteToWishlist"
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'failure' || result.type === 'error') {
				toast.error(
					String(
						('data' in result ? result.data?.message : undefined) ?? 'Could not add to wishlist.'
					)
				);
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
			if (result.type === 'failure' || result.type === 'error') {
				toast.error(
					String(
						('data' in result ? result.data?.message : undefined) ?? 'Could not add to collection.'
					)
				);
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
			if (result.type === 'failure' || result.type === 'error') {
				toast.error(
					String(('data' in result ? result.data?.message : undefined) ?? 'Could not remove item.')
				);
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
