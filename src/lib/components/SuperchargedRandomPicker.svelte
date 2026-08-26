<script lang="ts">
	import RandomPickerCollectionPanel from '$lib/components/RandomPickerCollectionPanel.svelte';
	import RandomPickerGenrePanel from '$lib/components/RandomPickerGenrePanel.svelte';
	import RandomPickRevealDialog from '$lib/components/RandomPickRevealDialog.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import type { Album, MediaItem } from '$lib/types/media';
	import {
		buildRandomMoviePool,
		pickRandomFromPool,
		type RandomMoviePoolOptions
	} from '$lib/utils/random-movie-pool';
	import { DEFAULT_GENRE_FILTER_MODE, type GenreFilterMode } from '$lib/utils/movie-genres';
	import { Folder, Shuffle, Tag, X } from 'phosphor-svelte';

	interface Props {
		items: MediaItem[];
		albums: Album[];
		genreOptions: string[];
	}

	let { items, albums, genreOptions }: Props = $props();

	const reducedMotion = $derived(settings.motion === 'reduced');

	const ROLL_MIN_MS = 3000;
	const ROLL_MAX_MS = 5000;
	const REDUCED_LOADING_MS = 350;

	let loadingDurationMs = $state(4000);

	function rollLoadingMs(): number {
		if (reducedMotion) return REDUCED_LOADING_MS;
		return ROLL_MIN_MS + Math.floor(Math.random() * (ROLL_MAX_MS - ROLL_MIN_MS + 1));
	}

	const dismissLabels = ['Watch time!', 'Thank you!', 'Enjoy the show!'] as const;
	const loadingPhrases = [
		'Figuring it out…',
		'Shuffling the shelf…',
		'Consulting the oracle…'
	] as const;

	function randomChoice<T>(choices: readonly T[]): T {
		return choices[Math.floor(Math.random() * choices.length)] ?? choices[0];
	}

	let showFilterDialog = $state(false);
	let showGenrePanel = $state(false);
	let showCollectionPanel = $state(false);
	let showRevealDialog = $state(false);
	let revealPhase = $state<'loading' | 'reveal'>('loading');
	let pickedItem = $state<MediaItem | null>(null);
	let loadingPhrase = $state<string>(loadingPhrases[0]);
	let dismissLabel = $state<string>(dismissLabels[0]);

	let selectedGenres = $state<string[]>([]);
	let genreFilterMode = $state<GenreFilterMode>(DEFAULT_GENRE_FILTER_MODE);
	let includedCollectionIds = $state<string[]>([]);
	let excludedCollectionIds = $state<string[]>([]);
	let activePoolOptions = $state<RandomMoviePoolOptions>({
		selectedGenres: [],
		genreFilterMode: DEFAULT_GENRE_FILTER_MODE,
		includedCollectionIds: [],
		excludedCollectionIds: []
	});

	const showSidePanel = $derived(showGenrePanel || showCollectionPanel);

	const collectionBadge = $derived.by(() => {
		const inCount = includedCollectionIds.length;
		const outCount = excludedCollectionIds.length;
		if (inCount === 0 && outCount === 0) return null;
		return `${inCount} in, ${outCount} out`;
	});

	const previewPool = $derived(
		buildRandomMoviePool(items, {
			selectedGenres,
			genreFilterMode,
			includedCollectionIds,
			excludedCollectionIds
		})
	);

	let revealTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		return () => clearTimeout(revealTimer);
	});

	function openFilterDialog() {
		showFilterDialog = true;
		showGenrePanel = false;
		showCollectionPanel = false;
	}

	function closeFilterDialog() {
		showFilterDialog = false;
		showGenrePanel = false;
		showCollectionPanel = false;
	}

	function openGenrePanel() {
		showCollectionPanel = false;
		showGenrePanel = true;
	}

	function closeGenrePanel() {
		showGenrePanel = false;
	}

	function openCollectionPanel() {
		showGenrePanel = false;
		showCollectionPanel = true;
	}

	function closeCollectionPanel() {
		showCollectionPanel = false;
	}

	function closeRevealDialog() {
		showRevealDialog = false;
		revealPhase = 'loading';
		pickedItem = null;
	}

	function beginPick(options: RandomMoviePoolOptions) {
		const pool = buildRandomMoviePool(items, options);

		if (pool.length === 0) {
			toast.error('No movies match those filters. Try widening the pool.');
			return;
		}

		activePoolOptions = {
			selectedGenres: [...options.selectedGenres],
			genreFilterMode: options.genreFilterMode ?? DEFAULT_GENRE_FILTER_MODE,
			includedCollectionIds: [...options.includedCollectionIds],
			excludedCollectionIds: [...options.excludedCollectionIds]
		};

		closeFilterDialog();
		showRevealDialog = true;
		revealPhase = 'loading';
		pickedItem = null;
		loadingPhrase = randomChoice(loadingPhrases);
		loadingDurationMs = rollLoadingMs();

		clearTimeout(revealTimer);
		revealTimer = setTimeout(() => {
			const choice = pickRandomFromPool(pool);
			pickedItem = choice;
			dismissLabel = randomChoice(dismissLabels);
			revealPhase = 'reveal';
		}, loadingDurationMs);
	}

	function handlePickFromFilters() {
		beginPick({
			selectedGenres,
			genreFilterMode,
			includedCollectionIds,
			excludedCollectionIds
		});
	}

	function handleRollAgain() {
		beginPick(activePoolOptions);
	}

	function onFilterKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		if (showGenrePanel) {
			closeGenrePanel();
			return;
		}
		if (showCollectionPanel) {
			closeCollectionPanel();
			return;
		}
		closeFilterDialog();
	}
</script>

<button
	type="button"
	onclick={openFilterDialog}
	class="pill-nav control-pill--accent"
	aria-haspopup="dialog"
>
	<Shuffle size={16} weight="bold" />
	Pick random
</button>

{#if showFilterDialog}
	<div
		class="random-filter anim-fade"
		role="dialog"
		aria-modal="true"
		aria-labelledby="random-filter-title"
	>
		<button
			type="button"
			class="random-filter__backdrop"
			aria-label="Close filter dialog"
			onclick={closeFilterDialog}
		></button>

		<div class="random-filter__cluster" class:random-filter__cluster--with-side={showSidePanel}>
			<div class="random-filter__panel surface-round anim-rise">
				<div class="flex items-start justify-between gap-3">
					<div>
						<h2
							id="random-filter-title"
							class="text-lg font-black tracking-wide text-stone-900 uppercase dark:text-amber-50"
						>
							Supercharged pick
						</h2>
						<p class="mt-1 text-sm font-medium text-[rgb(var(--color-text-secondary))]">
							Choose your pool, then roll the dice.
						</p>
					</div>
					<button
						type="button"
						class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] transition-colors hover:bg-black/5 hover:text-[rgb(var(--color-text))] dark:hover:bg-white/10"
						aria-label="Close dialog"
						onclick={closeFilterDialog}
					>
						<X size={16} weight="bold" />
					</button>
				</div>

				<div class="mt-5 space-y-4">
					{#if genreOptions.length > 0}
						<div class="space-y-2">
							<p
								class="text-xs font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase"
							>
								Genres
							</p>
							<button
								type="button"
								onclick={openGenrePanel}
								class="pill-nav {selectedGenres.length > 0
									? 'control-pill--active'
									: 'control-pill--accent'}"
								aria-expanded={showGenrePanel}
								aria-haspopup="dialog"
								aria-label="Filter random pick by genre"
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
						</div>
					{/if}

					{#if albums.length > 0}
						<div class="space-y-2">
							<p
								class="text-xs font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase"
							>
								Collections
							</p>
							<button
								type="button"
								onclick={openCollectionPanel}
								class="pill-nav {includedCollectionIds.length > 0 ||
								excludedCollectionIds.length > 0
									? 'control-pill--active'
									: 'control-pill--accent'}"
								aria-expanded={showCollectionPanel}
								aria-haspopup="dialog"
								aria-label="Filter random pick by collection"
							>
								<Folder size={16} weight="bold" />
								Collection
								{#if collectionBadge}
									<span
										class="inline-flex h-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-[10px] font-bold text-amber-400 dark:bg-amber-950"
									>
										{collectionBadge}
									</span>
								{/if}
							</button>
							<p class="text-xs font-medium text-[rgb(var(--color-text-tertiary))]">
								Include collections to widen the pool, or exclude them to narrow it.
							</p>
						</div>
					{/if}

					<p
						class="surface-round px-4 py-3 text-center text-sm font-bold text-stone-800 dark:text-stone-200"
						aria-live="polite"
					>
						{previewPool.length} movie{previewPool.length === 1 ? '' : 's'} in pool
					</p>
				</div>

				<div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
					<button type="button" class="btn-secondary px-5 py-2 text-xs" onclick={closeFilterDialog}>
						Cancel
					</button>
					<button
						type="button"
						class="btn-primary px-5 py-2 text-xs"
						disabled={previewPool.length === 0}
						onclick={handlePickFromFilters}
					>
						<Shuffle size={14} weight="bold" />
						Pick random
					</button>
				</div>
			</div>

			{#if showGenrePanel && genreOptions.length > 0}
				<RandomPickerGenrePanel
					options={genreOptions}
					selected={selectedGenres}
					mode={genreFilterMode}
					onChange={(genres) => {
						selectedGenres = genres;
					}}
					onModeChange={(mode) => {
						genreFilterMode = mode;
					}}
					onClose={closeGenrePanel}
				/>
			{/if}

			{#if showCollectionPanel && albums.length > 0}
				<RandomPickerCollectionPanel
					{albums}
					included={includedCollectionIds}
					excluded={excludedCollectionIds}
					onChangeIncluded={(ids) => {
						includedCollectionIds = ids;
					}}
					onChangeExcluded={(ids) => {
						excludedCollectionIds = ids;
					}}
					onClose={closeCollectionPanel}
				/>
			{/if}
		</div>
	</div>
{/if}

<svelte:window onkeydown={showFilterDialog ? onFilterKeydown : undefined} />

<RandomPickRevealDialog
	open={showRevealDialog}
	phase={revealPhase}
	item={pickedItem}
	{loadingPhrase}
	{dismissLabel}
	{loadingDurationMs}
	onRollAgain={handleRollAgain}
	onDismiss={closeRevealDialog}
/>

<style>
	.random-filter {
		position: fixed;
		inset: 0;
		z-index: 95;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
	}

	.random-filter__backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgb(0 0 0 / 0.58);
		backdrop-filter: blur(4px);
		cursor: pointer;
	}

	.random-filter__cluster {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.75rem;
		width: min(100%, 26rem);
	}

	.random-filter__cluster--with-side {
		width: min(100%, 48rem);
	}

	@media (min-width: 640px) {
		.random-filter__cluster--with-side {
			flex-direction: row;
			align-items: stretch;
		}
	}

	.random-filter__panel {
		flex: 1 1 26rem;
		min-width: 0;
		padding: 1.25rem;
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.4);
	}

	@media (min-width: 640px) {
		.random-filter__cluster--with-side .random-filter__panel {
			flex: 0 0 26rem;
		}
	}
</style>
