<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { FilmStrip, WarningCircle, X } from 'phosphor-svelte';
	import { tick } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { TmdbGenreSyncMode } from '$lib/utils/movie-genres';

	interface Props {
		isAdmin: boolean;
		movieCount: number;
	}

	let { isAdmin, movieCount }: Props = $props();

	let dialogOpen = $state(false);
	let syncing = $state(false);
	let syncForm: HTMLFormElement | undefined = $state();
	let pendingMode = $state<TmdbGenreSyncMode | null>(null);

	function openDialog() {
		dialogOpen = true;
	}

	function closeDialog() {
		if (syncing) return;
		dialogOpen = false;
		pendingMode = null;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeDialog();
	}

	async function startSync(mode: TmdbGenreSyncMode) {
		if (syncing) return;
		pendingMode = mode;
		await tick();
		syncForm?.requestSubmit();
	}
</script>

{#if isAdmin}
	<section class="module module--wide" aria-labelledby="module-catalog">
		<h2 id="module-catalog" class="module-title">
			<span class="led" aria-hidden="true"></span>
			Catalog
		</h2>

		<div class="catalog-row">
			<div class="catalog-copy">
				<p class="catalog-heading">
					<FilmStrip size={16} weight="bold" />
					TMDB genres
				</p>
				<p class="catalog-text">
					Pull fresh genre tags from TMDB for every movie in your catalog ({movieCount} total). Movies
					without a TMDB ID are skipped.
				</p>
			</div>
			<button
				type="button"
				class="control-pill control-pill--secondary sync-btn"
				disabled={movieCount === 0 || syncing}
				onclick={openDialog}
			>
				Sync TMDB genres
			</button>
		</div>

		<p class="hint">Admin only. Choose whether to merge or replace your existing genre tags.</p>
	</section>
{/if}

<svelte:window onkeydown={dialogOpen ? onKeydown : undefined} />

{#if dialogOpen}
	<div
		class="sync-dialog anim-fade"
		role="dialog"
		aria-modal="true"
		aria-labelledby="sync-genres-dialog-title"
	>
		<button
			type="button"
			class="sync-dialog__backdrop"
			aria-label="Cancel sync"
			disabled={syncing}
			onclick={closeDialog}
		></button>

		<div class="sync-dialog__panel surface-round anim-rise sync-dialog__panel--danger">
			<div class="flex items-start gap-3">
				<span
					class="inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-red-400/70 bg-red-500/10 text-red-600 dark:border-red-500/50 dark:text-red-400"
					aria-hidden="true"
				>
					<WarningCircle size={22} weight="bold" />
				</span>
				<div class="min-w-0 flex-1">
					<h2
						id="sync-genres-dialog-title"
						class="text-sm font-black tracking-wide text-stone-900 uppercase dark:text-amber-50"
					>
						Sync TMDB genres?
					</h2>
					<p class="mt-2 text-sm leading-snug font-medium text-[rgb(var(--color-text-secondary))]">
						This will update genres on every movie in your catalog (owned and wishlist). Movies
						without a TMDB ID are skipped.
					</p>
				</div>
				<button
					type="button"
					class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] transition-colors hover:bg-black/5 hover:text-[rgb(var(--color-text))] disabled:opacity-50 dark:hover:bg-white/10"
					aria-label="Close dialog"
					disabled={syncing}
					onclick={closeDialog}
				>
					<X size={16} weight="bold" />
				</button>
			</div>

			<div class="mt-4 space-y-2">
				<p
					class="text-[11px] font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase"
				>
					How should existing genres be handled?
				</p>
				<button
					type="button"
					class="choice-btn"
					disabled={syncing}
					onclick={() => startSync('keep')}
				>
					<span class="choice-btn__title">Keep existing genres</span>
					<span class="choice-btn__detail">
						Add TMDB genres to existing ones (your custom genres are kept)
					</span>
				</button>
				<button
					type="button"
					class="choice-btn choice-btn--danger"
					disabled={syncing}
					onclick={() => startSync('overwrite')}
				>
					<span class="choice-btn__title">Replace with TMDB</span>
					<span class="choice-btn__detail">
						Replace all genres with TMDB data (custom genres will be removed)
					</span>
				</button>
			</div>

			<div class="mt-5 flex justify-end">
				<button
					type="button"
					class="btn-secondary px-5 py-2 text-xs"
					disabled={syncing}
					onclick={closeDialog}
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

<form
	bind:this={syncForm}
	method="POST"
	action="?/syncTmdbGenres"
	class="hidden"
	use:enhance={() => {
		syncing = true;
		return async ({ result }) => {
			syncing = false;
			if (result.type === 'failure') {
				toast.error(String(result.data?.message ?? 'Genre sync failed.'));
				return;
			}
			if (result.type === 'success') {
				const data = result.data as {
					updated?: number;
					skipped?: number;
					failed?: number;
					total?: number;
				};
				const updated = data.updated ?? 0;
				const skipped = data.skipped ?? 0;
				const failed = data.failed ?? 0;
				let message = `Updated genres on ${updated} movie${updated === 1 ? '' : 's'}`;
				if (skipped > 0) {
					message += `, skipped ${skipped}`;
				}
				if (failed > 0) {
					message += `, ${failed} TMDB lookup${failed === 1 ? '' : 's'} failed`;
				}
				toast.success(`${message}.`);
				closeDialog();
				await invalidateAll();
			}
		};
	}}
>
	<input type="hidden" name="mode" value={pendingMode ?? ''} />
</form>

<style>
	.catalog-row {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.catalog-row {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.catalog-copy {
		min-width: 0;
	}

	.catalog-heading {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin: 0;
		font-size: 0.78rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgb(var(--color-text));
	}

	.catalog-text {
		margin: 0.45rem 0 0;
		font-size: 0.78rem;
		font-weight: 500;
		line-height: 1.45;
		color: rgb(var(--color-text-secondary));
	}

	.sync-btn {
		align-self: flex-start;
		white-space: nowrap;
	}

	.sync-dialog {
		position: fixed;
		inset: 0;
		z-index: 95;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
	}

	.sync-dialog__backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgb(0 0 0 / 0.58);
		backdrop-filter: blur(4px);
		cursor: pointer;
	}

	.sync-dialog__panel {
		position: relative;
		z-index: 1;
		width: min(100%, 26rem);
		padding: 1.25rem;
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.4);
	}

	.sync-dialog__panel--danger {
		border-color: rgb(239 68 68 / 0.45);
	}

	.choice-btn {
		display: block;
		width: 100%;
		padding: 0.85rem 1rem;
		border-radius: 1.5rem;
		border: 2px solid rgb(var(--color-border));
		background: rgb(var(--color-bg) / 0.65);
		text-align: left;
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			background 0.2s ease;
	}

	.choice-btn:hover:not(:disabled) {
		border-color: rgb(var(--color-accent));
		background: rgb(var(--color-accent-light) / 0.35);
	}

	.choice-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.choice-btn--danger:hover:not(:disabled) {
		border-color: rgb(239 68 68 / 0.65);
		background: rgb(239 68 68 / 0.08);
	}

	.choice-btn__title {
		display: block;
		font-size: 0.72rem;
		font-weight: 900;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: rgb(var(--color-text));
	}

	.choice-btn__detail {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1.35;
		color: rgb(var(--color-text-secondary));
	}
</style>
