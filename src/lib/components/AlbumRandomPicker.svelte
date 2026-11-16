<script lang="ts">
	import { enhance } from '$app/forms';
	import { CATEGORY_ACTION_WORDING, type MediaCategory } from '$lib/types/media';
	import RandomPickRevealDialog from './RandomPickRevealDialog.svelte';
	import { createRandomPick, type RandomPickItem } from '$lib/utils/random-pick.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { DiceSix, X } from 'phosphor-svelte';
	import { scale } from 'svelte/transition';

	export type PickableItem = RandomPickItem;

	interface Props {
		unwatchedItems: PickableItem[];
		category: MediaCategory;
		isAdmin: boolean;
		onPick: (item: PickableItem) => void;
		/** Form action for marking an item watched after a random pick. */
		markWatchedAction?: string;
	}

	let {
		unwatchedItems,
		category,
		isAdmin,
		onPick,
		markWatchedAction = '/admin/items?/toggleAlbumWatched'
	}: Props = $props();

	const wording = $derived(CATEGORY_ACTION_WORDING[category]);

	const pick = createRandomPick();
	let pickedItem = $state<PickableItem | null>(null);
	let showWatchedPrompt = $state(false);
	const canPick = $derived(unwatchedItems.length > 0);
	function pickRandom() {
		showWatchedPrompt = false;
		pick.start(unwatchedItems);
	}
	function closeReveal() {
		pickedItem = pick.item;
		pick.close();
		if (pickedItem) {
			showWatchedPrompt = isAdmin;
			onPick(pickedItem);
		}
	}

	function dismissPrompt() {
		showWatchedPrompt = false;
		pickedItem = null;
	}
</script>

<div class="flex max-w-full flex-col items-start gap-2">
	<button
		type="button"
		onclick={pickRandom}
		disabled={!canPick}
		class="pill-nav control-pill--accent disabled:cursor-not-allowed disabled:opacity-50"
	>
		<span class="dice-icon">
			<DiceSix size={16} weight="bold" />
		</span>
		{canPick ? 'Pick random' : `All ${wording.done}`}
	</button>

	{#if showWatchedPrompt && pickedItem}
		<div
			transition:scale={{ duration: 200, start: 0.92 }}
			class="surface-round w-full max-w-sm space-y-3 border border-amber-400/30 p-4"
			role="dialog"
			aria-labelledby="watched-prompt-title"
		>
			<div class="flex items-start justify-between gap-2">
				<p
					id="watched-prompt-title"
					class="text-xs leading-snug font-bold text-stone-800 dark:text-stone-200"
				>
					Mark <em class="text-amber-700 not-italic dark:text-amber-400">{pickedItem.title}</em> as
					{wording.done}? It won't appear in future picks.
				</p>
				<button
					type="button"
					onclick={dismissPrompt}
					class="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] hover:bg-stone-900/5 hover:text-[rgb(var(--color-text))] dark:hover:bg-stone-800"
					aria-label="Dismiss"
				>
					<X size={14} weight="bold" />
				</button>
			</div>
			<div class="flex flex-col gap-2">
				<form
					method="POST"
					action={markWatchedAction}
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'failure' || result.type === 'error') {
								toast.error('Could not mark this item. Please try again.');
								return;
							}
							dismissPrompt();
							await update();
						};
					}}
				>
					<input type="hidden" name="id" value={pickedItem.id} />
					<input type="hidden" name="watched" value="true" />
					<button type="submit" class="btn-primary w-full justify-center px-3 py-2 text-xs">
						Yes, mark {wording.done}
					</button>
				</form>
				<button
					type="button"
					onclick={dismissPrompt}
					class="btn-secondary w-full justify-center px-3 py-2 text-xs"
				>
					No, keep in pool
				</button>
			</div>
		</div>
	{/if}
</div>

<RandomPickRevealDialog
	open={pick.open}
	phase={pick.phase}
	item={pick.item}
	loadingDurationMs={pick.duration}
	loadingPhrase="Shuffling the shelf…"
	dismissLabel="That's the one!"
	onRollAgain={pickRandom}
	onDismiss={closeReveal}
/>
