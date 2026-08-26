<script lang="ts">
	import type { Album } from '$lib/types/media';
	import { ArrowLeft, Folder, X } from 'phosphor-svelte';

	interface Props {
		albums: Album[];
		included: string[];
		excluded: string[];
		onChangeIncluded: (ids: string[]) => void;
		onChangeExcluded: (ids: string[]) => void;
		onClose: () => void;
	}

	let { albums, included, excluded, onChangeIncluded, onChangeExcluded, onClose }: Props = $props();

	const includedSet = $derived(new Set(included));
	const excludedSet = $derived(new Set(excluded));

	const neutralAlbums = $derived(
		albums.filter((a) => !includedSet.has(a.id) && !excludedSet.has(a.id))
	);
	const includedAlbums = $derived(albums.filter((a) => includedSet.has(a.id)));
	const excludedAlbums = $derived(albums.filter((a) => excludedSet.has(a.id)));

	function includeAll() {
		onChangeIncluded(albums.map((a) => a.id));
		onChangeExcluded([]);
	}

	function excludeAll() {
		onChangeExcluded(albums.map((a) => a.id));
		onChangeIncluded([]);
	}

	function moveToInclude(albumId: string) {
		onChangeExcluded(excluded.filter((id) => id !== albumId));
		if (!includedSet.has(albumId)) {
			onChangeIncluded([...included, albumId]);
		}
	}

	function moveToExclude(albumId: string) {
		onChangeIncluded(included.filter((id) => id !== albumId));
		if (!excludedSet.has(albumId)) {
			onChangeExcluded([...excluded, albumId]);
		}
	}

	function handleIncludeColumnClick(albumId: string) {
		if (includedSet.has(albumId)) {
			moveToExclude(albumId);
		} else {
			moveToInclude(albumId);
		}
	}
</script>

<div
	class="collection-panel surface-round anim-rise"
	role="dialog"
	aria-modal="true"
	aria-labelledby="random-collection-panel-title"
>
	<div class="flex items-start justify-between gap-3">
		<div class="flex min-w-0 items-center gap-2">
			<span
				class="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-amber-700 dark:text-amber-400"
				aria-hidden="true"
			>
				<Folder size={16} weight="bold" />
			</span>
			<div class="min-w-0">
				<h3
					id="random-collection-panel-title"
					class="text-sm font-black tracking-wide text-stone-900 uppercase dark:text-amber-50"
				>
					Collections
				</h3>
				<p class="mt-0.5 text-xs font-medium text-[rgb(var(--color-text-secondary))]">
					{#if included.length > 0 || excluded.length > 0}
						{included.length} in, {excluded.length} out
					{:else}
						Ungrouped movies only
					{/if}
				</p>
			</div>
		</div>
		<button
			type="button"
			class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] transition-colors hover:bg-black/5 hover:text-[rgb(var(--color-text))] dark:hover:bg-white/10"
			aria-label="Close collection panel"
			onclick={onClose}
		>
			<X size={16} weight="bold" />
		</button>
	</div>

	<div class="collection-panel__columns mt-4">
		<div class="collection-panel__column">
			<div class="collection-panel__column-header">
				<p
					class="text-[10px] font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase"
				>
					Include
				</p>
				<button
					type="button"
					class="collection-panel__bulk-btn"
					onclick={includeAll}
					disabled={albums.length === 0}
				>
					Include all
				</button>
			</div>
			<div
				class="collection-panel__scroll"
				role="listbox"
				aria-label="Included collections"
				aria-multiselectable="true"
			>
				<div class="collection-panel__list">
					{#each [...neutralAlbums, ...includedAlbums] as album (album.id)}
						<button
							type="button"
							role="option"
							aria-selected={includedSet.has(album.id)}
							class="collection-panel__pill {includedSet.has(album.id)
								? 'collection-panel__pill--active'
								: 'collection-panel__pill--idle'}"
							onclick={() => handleIncludeColumnClick(album.id)}
						>
							{album.title}
						</button>
					{/each}
					{#if neutralAlbums.length === 0 && includedAlbums.length === 0}
						<p class="collection-panel__empty">None included</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="collection-panel__divider" aria-hidden="true"></div>

		<div class="collection-panel__column">
			<div class="collection-panel__column-header">
				<p
					class="text-[10px] font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase"
				>
					Exclude
				</p>
				<button
					type="button"
					class="collection-panel__bulk-btn"
					onclick={excludeAll}
					disabled={albums.length === 0}
				>
					Exclude all
				</button>
			</div>
			<div
				class="collection-panel__scroll"
				role="listbox"
				aria-label="Excluded collections"
				aria-multiselectable="true"
			>
				<div class="collection-panel__list">
					{#each excludedAlbums as album (album.id)}
						<button
							type="button"
							role="option"
							aria-selected={true}
							class="collection-panel__pill collection-panel__pill--excluded"
							onclick={() => moveToInclude(album.id)}
						>
							{album.title}
						</button>
					{/each}
					{#if excludedAlbums.length === 0}
						<p class="collection-panel__empty">None excluded</p>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="collection-panel__footer mt-4 flex flex-wrap items-center gap-2">
		<button type="button" class="btn-secondary ml-auto px-4 py-1.5 text-xs" onclick={onClose}>
			<ArrowLeft size={12} weight="bold" />
			Back to filters
		</button>
	</div>
</div>

<style>
	.collection-panel {
		display: flex;
		flex-direction: column;
		width: min(100%, 22rem);
		max-height: min(90vh, 28rem);
		padding: 1.25rem;
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.4);
	}

	.collection-panel__columns {
		display: flex;
		flex: 1;
		min-height: 0;
		gap: 0.75rem;
	}

	.collection-panel__column {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
	}

	.collection-panel__column-header {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.collection-panel__bulk-btn {
		border-radius: 9999px;
		padding: 0.25rem 0.5rem;
		font-size: 0.5625rem;
		font-weight: 800;
		line-height: 1.2;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: rgb(146 64 14);
		transition: background-color 0.15s;
	}

	.collection-panel__bulk-btn:hover:not(:disabled) {
		background: rgb(251 191 36 / 0.15);
	}

	.collection-panel__bulk-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	:global(.dark) .collection-panel__bulk-btn {
		color: rgb(252 211 77);
	}

	.collection-panel__divider {
		flex-shrink: 0;
		width: 1px;
		align-self: stretch;
		background: rgb(var(--color-border) / 0.6);
	}

	.collection-panel__scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding-right: 0.15rem;
	}

	.collection-panel__list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.collection-panel__pill {
		border-radius: 9999px;
		padding: 0.5rem 0.75rem;
		text-align: left;
		font-size: 0.625rem;
		font-weight: 800;
		line-height: 1.2;
		letter-spacing: 0.04em;
		transition:
			background-color 0.15s,
			border-color 0.15s,
			color 0.15s;
	}

	.collection-panel__pill--active {
		background: rgb(251 191 36 / 0.9);
		color: rgb(28 25 23);
	}

	.collection-panel__pill--idle {
		border: 1px solid rgb(251 191 36 / 0.35);
		color: rgb(120 113 108);
	}

	:global(.dark) .collection-panel__pill--idle {
		color: rgb(168 162 158);
	}

	.collection-panel__pill--idle:hover {
		background: rgb(251 191 36 / 0.08);
		border-color: rgb(251 191 36 / 0.5);
	}

	.collection-panel__pill--excluded {
		border: 1px solid rgb(239 68 68 / 0.45);
		background: rgb(239 68 68 / 0.12);
		color: rgb(185 28 28);
	}

	:global(.dark) .collection-panel__pill--excluded {
		color: rgb(252 165 165);
	}

	.collection-panel__pill--excluded:hover {
		background: rgb(239 68 68 / 0.2);
	}

	.collection-panel__empty {
		padding: 0.75rem 0.5rem;
		text-align: center;
		font-size: 0.625rem;
		font-weight: 600;
		color: rgb(var(--color-text-tertiary));
	}

	.collection-panel__footer {
		flex-shrink: 0;
	}
</style>
