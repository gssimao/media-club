<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import {
		buildGenreCatalog,
		dedupeGenres,
		genreIsSelected,
		getDisplayGenres,
		isTmdbGenreName,
		MAX_GENRE_LENGTH,
		normalizeGenreName,
		toggleGenreSelection
	} from '$lib/utils/movie-genres';
	import type { MediaItem } from '$lib/types/media';
	import { Plus, Tag, Trash, X } from 'phosphor-svelte';
	import { toast } from '$lib/stores/toast.svelte';

	interface Props {
		item: Pick<MediaItem, 'id' | 'metadata' | 'title'>;
		action: string;
		deleteCustomGenreAction?: string;
		variant?: 'sky' | 'amber';
		catalogItems?: { metadata: Record<string, unknown> | null }[];
		onClose: () => void;
	}

	let {
		item,
		action,
		deleteCustomGenreAction = '/admin/items?/deleteCustomGenre',
		variant = 'amber',
		catalogItems = [],
		onClose
	}: Props = $props();

	let draftGenres = $state([...getDisplayGenres(item)]);
	let newGenreInput = $state('');
	let pendingCustomGenres = $state<string[]>([]);
	let genreToDelete = $state<string | null>(null);
	let deleteForm: HTMLFormElement | undefined = $state();

	const catalog = $derived(buildGenreCatalog(catalogItems));
	const customGenres = $derived(
		dedupeGenres([...catalog.customGenres, ...pendingCustomGenres]).filter(
			(genre) => !isTmdbGenreName(genre)
		)
	);

	const activePillClass = $derived(
		variant === 'sky' ? 'bg-sky-500/90 text-white' : 'bg-amber-400/90 text-stone-900'
	);

	const idlePillClass = $derived(
		variant === 'sky'
			? 'border border-sky-400/50 text-sky-800 hover:bg-sky-400/10 dark:text-sky-300'
			: 'border border-amber-400/50 text-amber-800 hover:bg-amber-400/10 dark:text-amber-300'
	);

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onClose();
	}

	function toggleGenre(genre: string) {
		draftGenres = toggleGenreSelection(draftGenres, genre);
	}

	function addNewGenre() {
		const normalized = normalizeGenreName(newGenreInput);
		if (!normalized) return;

		draftGenres = dedupeGenres([...draftGenres, normalized]);
		if (!isTmdbGenreName(normalized)) {
			pendingCustomGenres = dedupeGenres([...pendingCustomGenres, normalized]);
		}
		newGenreInput = '';
	}

	function handleNewGenreKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addNewGenre();
		}
	}

	function requestDeleteCustomGenre(genre: string) {
		genreToDelete = genre;
	}

	function confirmDeleteCustomGenre() {
		deleteForm?.requestSubmit();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="genre-picker" role="dialog" aria-modal="true" aria-labelledby="genre-picker-title">
	<button type="button" class="genre-picker__backdrop" aria-label="Close" onclick={onClose}
	></button>

	<div class="genre-picker__panel surface-round anim-rise">
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-2">
					<span
						class="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-amber-700 dark:text-amber-400"
						aria-hidden="true"
					>
						<Tag size={18} weight="bold" />
					</span>
					<div class="min-w-0">
						<h2
							id="genre-picker-title"
							class="text-sm font-black tracking-wide text-stone-900 uppercase dark:text-amber-50"
						>
							Edit genres
						</h2>
						<p class="mt-0.5 truncate text-xs font-medium text-[rgb(var(--color-text-secondary))]">
							{item.title}
						</p>
					</div>
				</div>
			</div>
			<button
				type="button"
				class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] transition-colors hover:bg-black/5 hover:text-[rgb(var(--color-text))] dark:hover:bg-white/10"
				aria-label="Close dialog"
				onclick={onClose}
			>
				<X size={16} weight="bold" />
			</button>
		</div>

		<div class="genre-picker__body mt-4 space-y-4">
			{#if customGenres.length > 0}
				<section>
					<h3 class="genre-picker__heading">Your genres</h3>
					<div class="mt-2 flex flex-wrap gap-1.5">
						{#each customGenres as genre (genre)}
							<div class="inline-flex items-center gap-0.5">
								<button
									type="button"
									class="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-colors {genreIsSelected(
										draftGenres,
										genre
									)
										? activePillClass
										: idlePillClass}"
									onclick={() => toggleGenre(genre)}
								>
									{genre}
								</button>
								{#if catalog.customGenres.some((value) => value.toLowerCase() === genre.toLowerCase())}
									<button
										type="button"
										class="inline-flex size-6 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
										title="Remove “{genre}” from your catalog"
										aria-label="Delete custom genre {genre}"
										onclick={() => requestDeleteCustomGenre(genre)}
									>
										<Trash size={12} weight="bold" />
									</button>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if catalog.catalogTmdbGenres.length > 0}
				<section>
					<h3 class="genre-picker__heading">In your catalog</h3>
					<div class="mt-2 flex flex-wrap gap-1.5">
						{#each catalog.catalogTmdbGenres as genre (genre)}
							<button
								type="button"
								class="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-colors {genreIsSelected(
									draftGenres,
									genre
								)
									? activePillClass
									: idlePillClass}"
								onclick={() => toggleGenre(genre)}
							>
								{genre}
							</button>
						{/each}
					</div>
				</section>
			{/if}

			<section>
				<h3 class="genre-picker__heading">Classic genres</h3>
				<div class="mt-2 flex flex-wrap gap-1.5">
					{#each catalog.classicTmdbGenres as genre (genre)}
						<button
							type="button"
							class="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-colors {genreIsSelected(
								draftGenres,
								genre
							)
								? activePillClass
								: idlePillClass}"
							onclick={() => toggleGenre(genre)}
						>
							{genre}
						</button>
					{/each}
				</div>
			</section>

			<section>
				<h3 class="genre-picker__heading">Create genre</h3>
				<div class="mt-2 flex items-center gap-2">
					<input
						type="text"
						bind:value={newGenreInput}
						maxlength={MAX_GENRE_LENGTH}
						placeholder="New custom genre"
						class="input-round min-w-0 flex-1 px-3 py-2 text-xs"
						aria-label="New custom genre name"
						onkeydown={handleNewGenreKeydown}
					/>
					<button
						type="button"
						class="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-text-secondary))] transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400"
						title="Add genre to selection"
						aria-label="Add genre to selection"
						onclick={addNewGenre}
					>
						<Plus size={14} weight="bold" />
					</button>
				</div>
			</section>
		</div>

		<form
			method="POST"
			{action}
			class="mt-5 flex flex-wrap justify-end gap-2"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'failure') {
						toast.error(String(result.data?.message ?? 'Could not update genres.'));
						return;
					}
					toast.success('Genres updated.');
					onClose();
					await update({ reset: false });
				};
			}}
		>
			<input type="hidden" name="id" value={item.id} />
			<input type="hidden" name="genres" value={JSON.stringify(draftGenres)} />
			<button type="button" class="btn-secondary px-5 py-2 text-xs" onclick={onClose}>
				Cancel
			</button>
			<button type="submit" class="btn-primary px-5 py-2 text-xs">Save genres</button>
		</form>
	</div>
</div>

<form
	bind:this={deleteForm}
	method="POST"
	action={deleteCustomGenreAction}
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			const deleted = genreToDelete;
			genreToDelete = null;
			if (result.type === 'failure') {
				toast.error(String(result.data?.message ?? 'Could not delete genre.'));
				return;
			}
			if (deleted) {
				draftGenres = draftGenres.filter((g) => g.toLowerCase() !== deleted.toLowerCase());
				pendingCustomGenres = pendingCustomGenres.filter(
					(g) => g.toLowerCase() !== deleted.toLowerCase()
				);
				toast.success(`Removed custom genre “${deleted}” from your catalog.`);
			}
			await update({ reset: false });
		};
	}}
>
	<input type="hidden" name="genre" value={genreToDelete ?? ''} />
</form>

<ConfirmDialog
	open={genreToDelete !== null}
	title="Delete custom genre?"
	message={genreToDelete
		? `Remove “${genreToDelete}” from every movie and streaming item? This cannot be undone.`
		: ''}
	confirmLabel="Delete genre"
	cancelLabel="Cancel"
	variant="danger"
	onCancel={() => (genreToDelete = null)}
	onConfirm={confirmDeleteCustomGenre}
/>

<style>
	.genre-picker {
		position: fixed;
		inset: 0;
		z-index: 95;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
	}

	.genre-picker__backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgb(0 0 0 / 0.58);
		backdrop-filter: blur(4px);
		cursor: pointer;
	}

	.genre-picker__panel {
		position: relative;
		z-index: 1;
		width: min(100%, 28rem);
		max-height: min(90vh, 40rem);
		padding: 1.25rem;
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.4);
		display: flex;
		flex-direction: column;
	}

	.genre-picker__body {
		overflow-y: auto;
		min-height: 0;
		padding-right: 0.15rem;
	}

	.genre-picker__heading {
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgb(var(--color-text-secondary));
	}
</style>
