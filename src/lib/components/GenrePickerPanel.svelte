<script lang="ts">
	import {
		DEFAULT_GENRE_FILTER_MODE,
		genreIsSelected,
		toggleGenreSelection,
		type GenreFilterMode
	} from '$lib/utils/movie-genres';
	import { ArrowLeft, Tag, X } from 'phosphor-svelte';

	interface Props {
		options: string[];
		selected: string[];
		mode?: GenreFilterMode;
		onChange: (selected: string[]) => void;
		onModeChange?: (mode: GenreFilterMode) => void;
		onClose: () => void;
		titleId?: string;
		title?: string;
		footerActionLabel?: string;
	}

	let {
		options,
		selected,
		mode = DEFAULT_GENRE_FILTER_MODE,
		onChange,
		onModeChange,
		onClose,
		titleId = 'genre-picker-panel-title',
		title = 'Select genres',
		footerActionLabel = 'Back to filters'
	}: Props = $props();

	function toggleGenre(genre: string) {
		onChange(toggleGenreSelection(selected, genre));
	}

	function clearSelection() {
		onChange([]);
	}

	function setMode(nextMode: GenreFilterMode) {
		if (nextMode === mode) return;
		onModeChange?.(nextMode);
	}

	const selectionSummary = $derived.by(() => {
		if (selected.length === 0) return 'Any genre (no filter)';
		if (selected.length === 1) return '1 selected';
		return mode === 'all'
			? `${selected.length} selected, match all`
			: `${selected.length} selected, match any`;
	});
</script>

<div
	class="genre-panel surface-round anim-rise"
	role="dialog"
	aria-modal="true"
	aria-labelledby={titleId}
>
	<div class="flex items-start justify-between gap-3">
		<div class="flex min-w-0 items-center gap-2">
			<span
				class="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-amber-700 dark:text-amber-400"
				aria-hidden="true"
			>
				<Tag size={16} weight="bold" />
			</span>
			<div class="min-w-0">
				<h3
					id={titleId}
					class="text-sm font-black tracking-wide text-stone-900 uppercase dark:text-amber-50"
				>
					{title}
				</h3>
				<p class="mt-0.5 text-xs font-medium text-[rgb(var(--color-text-secondary))]">
					{selectionSummary}
				</p>
			</div>
		</div>
		<button
			type="button"
			class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] transition-colors hover:bg-black/5 hover:text-[rgb(var(--color-text))] dark:hover:bg-white/10"
			aria-label="Close genre panel"
			onclick={onClose}
		>
			<X size={16} weight="bold" />
		</button>
	</div>

	<div class="genre-panel__mode mt-4" role="group" aria-label="Genre match mode">
		<button
			type="button"
			class="genre-panel__mode-btn {mode === 'any' ? 'genre-panel__mode-btn--active' : ''}"
			aria-pressed={mode === 'any'}
			onclick={() => setMode('any')}
		>
			Match any genre
		</button>
		<button
			type="button"
			class="genre-panel__mode-btn {mode === 'all' ? 'genre-panel__mode-btn--active' : ''}"
			aria-pressed={mode === 'all'}
			onclick={() => setMode('all')}
		>
			Match all genres
		</button>
	</div>

	<div
		class="genre-panel__scroll mt-4"
		role="listbox"
		aria-label="Genre options"
		aria-multiselectable="true"
	>
		<div class="genre-panel__grid">
			{#each options as genre (genre)}
				<button
					type="button"
					role="option"
					aria-selected={genreIsSelected(selected, genre)}
					class="genre-panel__pill {genreIsSelected(selected, genre)
						? 'genre-panel__pill--active'
						: 'genre-panel__pill--idle'}"
					onclick={() => toggleGenre(genre)}
				>
					{genre}
				</button>
			{/each}
		</div>
	</div>

	<div class="genre-panel__footer mt-4 flex flex-wrap items-center gap-2">
		{#if selected.length > 0}
			<button
				type="button"
				class="rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide text-amber-700 uppercase transition-colors hover:bg-amber-400/15 dark:text-amber-400"
				onclick={clearSelection}
			>
				Clear all
			</button>
		{/if}
		<button type="button" class="btn-secondary ml-auto px-4 py-1.5 text-xs" onclick={onClose}>
			<ArrowLeft size={12} weight="bold" />
			{footerActionLabel}
		</button>
	</div>
</div>

<style>
	.genre-panel {
		display: flex;
		flex-direction: column;
		width: min(100%, 20rem);
		max-height: min(90vh, 28rem);
		padding: 1.25rem;
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.4);
	}

	.genre-panel__scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding-right: 0.15rem;
	}

	.genre-panel__mode {
		display: flex;
		gap: 0.375rem;
		padding: 0.25rem;
		border-radius: 9999px;
		background: rgb(0 0 0 / 0.04);
	}

	:global(.dark) .genre-panel__mode {
		background: rgb(255 255 255 / 0.06);
	}

	.genre-panel__mode-btn {
		flex: 1 1 0;
		border-radius: 9999px;
		border: none;
		padding: 0.5rem 0.625rem;
		font-size: 0.625rem;
		font-weight: 800;
		line-height: 1.2;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: rgb(120 113 108);
		background: transparent;
		transition:
			background-color 0.15s,
			color 0.15s;
		cursor: pointer;
	}

	:global(.dark) .genre-panel__mode-btn {
		color: rgb(168 162 158);
	}

	.genre-panel__mode-btn--active {
		background: rgb(251 191 36 / 0.9);
		color: rgb(28 25 23);
	}

	.genre-panel__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
	}

	@media (min-width: 480px) {
		.genre-panel__grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.genre-panel__pill {
		border-radius: 9999px;
		padding: 0.5rem 0.625rem;
		text-align: center;
		font-size: 0.625rem;
		font-weight: 800;
		line-height: 1.2;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		transition:
			background-color 0.15s,
			border-color 0.15s,
			color 0.15s;
	}

	.genre-panel__pill--active {
		background: rgb(251 191 36 / 0.9);
		color: rgb(28 25 23);
	}

	.genre-panel__pill--idle {
		border: 1px solid rgb(251 191 36 / 0.5);
		color: rgb(146 64 14);
	}

	:global(.dark) .genre-panel__pill--idle {
		color: rgb(252 211 77);
	}

	.genre-panel__pill--idle:hover {
		background: rgb(251 191 36 / 0.1);
	}

	.genre-panel__footer {
		flex-shrink: 0;
	}
</style>
