<script lang="ts">
	import { enhance } from '$app/forms';
	import { CATEGORY_ACTION_WORDING, type MediaCategory, type MediaItem } from '$lib/types/media';
	import { DiceSix, X } from 'phosphor-svelte';
	import { scale } from 'svelte/transition';

	interface Props {
		unwatchedItems: MediaItem[];
		category: MediaCategory;
		isAdmin: boolean;
		onPick: (item: MediaItem) => void;
	}

	let { unwatchedItems, category, isAdmin, onPick }: Props = $props();

	const wording = $derived(CATEGORY_ACTION_WORDING[category]);

	let lastRoll = $state<number | null>(null);
	let pickedItem = $state<MediaItem | null>(null);
	let showWatchedPrompt = $state(false);
	let rolling = $state(false);

	const ROLL_MS = 550;

	const poolSize = $derived(unwatchedItems.length);
	const canPick = $derived(poolSize > 0);

	let rollTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		return () => clearTimeout(rollTimer);
	});

	function pickRandom() {
		if (!canPick || rolling) return;

		rolling = true;
		showWatchedPrompt = false;

		rollTimer = setTimeout(() => {
			const roll = Math.floor(Math.random() * poolSize) + 1;
			const item = unwatchedItems[roll - 1];

			lastRoll = roll;
			pickedItem = item;
			showWatchedPrompt = isAdmin;
			rolling = false;
			onPick(item);
		}, ROLL_MS);
	}

	function dismissPrompt() {
		showWatchedPrompt = false;
		pickedItem = null;
	}
</script>

<div class="flex w-full flex-col gap-2">
	<button
		type="button"
		onclick={pickRandom}
		disabled={!canPick || rolling}
		class="pill-nav inline-flex w-full items-center justify-center gap-2 bg-amber-400/15 text-amber-700 hover:bg-amber-400/25 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-300"
	>
		<span class="dice-icon" class:is-rolling={rolling}>
			<DiceSix size={16} weight="bold" />
		</span>
		{rolling ? 'Rolling…' : canPick ? 'Pick random' : `All ${wording.done}`}
	</button>

	{#if lastRoll !== null && poolSize > 0 && !rolling}
		<p
			class="surface-round w-full px-4 py-3 text-center text-sm font-bold text-stone-800 dark:text-stone-200"
			aria-live="polite"
		>
			{#key lastRoll}
				<span
					in:scale={{ duration: 300, start: 0.5 }}
					class="inline-block text-3xl font-black text-amber-700 tabular-nums dark:text-amber-400"
				>
					{lastRoll}
				</span>
			{/key}
			<span
				class="mt-1 block text-xs font-semibold tracking-wide text-[rgb(var(--color-text-tertiary))] uppercase"
			>
				of {poolSize}
			</span>
		</p>
	{/if}

	{#if showWatchedPrompt && pickedItem && !rolling}
		<div
			transition:scale={{ duration: 200, start: 0.92 }}
			class="surface-round w-full space-y-3 border border-amber-400/30 p-4"
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
					class="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] hover:bg-stone-900/5 hover:text-[rgb(var(--color-text))] dark:hover:bg-stone-800"
					aria-label="Dismiss"
				>
					<X size={14} weight="bold" />
				</button>
			</div>
			<div class="flex flex-col gap-2">
				<form
					method="POST"
					action="/admin/items?/toggleAlbumWatched"
					use:enhance={() => {
						return async ({ update }) => {
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

<style>
	@keyframes dice-tumble {
		0% {
			transform: rotate(0deg) scale(1);
		}
		30% {
			transform: rotate(160deg) scale(1.25);
		}
		60% {
			transform: rotate(280deg) scale(0.95);
		}
		100% {
			transform: rotate(360deg) scale(1);
		}
	}

	.dice-icon {
		display: inline-flex;
	}

	.dice-icon.is-rolling {
		animation: dice-tumble 0.55s cubic-bezier(0.34, 1.3, 0.64, 1) infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.dice-icon.is-rolling {
			animation: none;
		}
	}

	:global([data-motion='reduced']) .dice-icon.is-rolling {
		animation: none;
	}
</style>
