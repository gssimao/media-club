<script lang="ts">
	import GenrePickerPanel from '$lib/components/GenrePickerPanel.svelte';
	import { DEFAULT_GENRE_FILTER_MODE, type GenreFilterMode } from '$lib/utils/movie-genres';
	import { Tag } from 'phosphor-svelte';

	interface Props {
		options: string[];
		selectedGenres: string[];
		genreFilterMode?: GenreFilterMode;
		onFilterChange: (genres: string[], mode: GenreFilterMode) => void;
	}

	let {
		options,
		selectedGenres = $bindable([]),
		genreFilterMode = $bindable(DEFAULT_GENRE_FILTER_MODE),
		onFilterChange
	}: Props = $props();

	let showPanel = $state(false);

	function openPanel() {
		showPanel = true;
	}

	function closePanel() {
		showPanel = false;
	}

	function handleChange(genres: string[]) {
		selectedGenres = genres;
		onFilterChange(genres, genreFilterMode);
	}

	function handleModeChange(mode: GenreFilterMode) {
		genreFilterMode = mode;
		onFilterChange(selectedGenres, mode);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		closePanel();
	}
</script>

{#if options.length > 0}
	<button
		type="button"
		onclick={openPanel}
		class="pill-nav {selectedGenres.length > 0 ? 'control-pill--active' : 'control-pill--accent'}"
		aria-expanded={showPanel}
		aria-haspopup="dialog"
		aria-label="Filter by genre"
	>
		<Tag size={16} weight="bold" />
		Genre
		{#if selectedGenres.length > 0}
			<span
				class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-xs font-bold text-amber-400 dark:bg-amber-950"
			>
				{selectedGenres.length}
			</span>
		{/if}
	</button>

	{#if showPanel}
		<div class="genre-filter" role="presentation">
			<button
				type="button"
				class="genre-filter__backdrop"
				aria-label="Close genre filter"
				onclick={closePanel}
			></button>

			<div class="genre-filter__panel-slot">
				<GenrePickerPanel
					{options}
					selected={selectedGenres}
					mode={genreFilterMode}
					onChange={handleChange}
					onModeChange={handleModeChange}
					onClose={closePanel}
					titleId="catalog-genre-panel-title"
					footerActionLabel="Done"
				/>
			</div>
		</div>
	{/if}
{/if}

<svelte:window onkeydown={showPanel ? onKeydown : undefined} />

<style>
	.genre-filter {
		position: fixed;
		inset: 0;
		z-index: 90;
	}

	.genre-filter__backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgb(0 0 0 / 0.35);
		backdrop-filter: blur(2px);
		cursor: pointer;
	}

	.genre-filter__panel-slot {
		position: absolute;
		top: calc(var(--nav-dial-reserve-h) + 1.25rem);
		left: calc(var(--nav-dial-inset) + var(--nav-dial-reserve-w) + 0.25rem);
		z-index: 1;
		width: min(calc(100vw - var(--nav-dial-reserve-w) - 2rem), 20rem);
	}

	@media (max-width: 767px) {
		.genre-filter__panel-slot {
			top: auto;
			left: 1rem;
			right: 1rem;
			bottom: 1rem;
			width: auto;
			display: flex;
			justify-content: center;
		}
	}
</style>
