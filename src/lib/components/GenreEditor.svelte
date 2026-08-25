<script lang="ts">
	import { enhance } from '$app/forms';
	import { getDisplayGenres, removeGenre } from '$lib/utils/movie-genres';
	import type { MediaItem } from '$lib/types/media';
	import { Plus, X } from 'phosphor-svelte';
	import { toast } from '$lib/stores/toast.svelte';

	interface Props {
		item: Pick<MediaItem, 'id' | 'metadata'>;
		action: string;
		isAdmin: boolean;
		/** Sky tint for streaming cards; amber for catalog movies. */
		variant?: 'sky' | 'amber';
	}

	let { item, action, isAdmin, variant = 'amber' }: Props = $props();

	const genres = $derived(getDisplayGenres(item));
	let newGenreInput = $state('');

	const activePillClass = $derived(
		variant === 'sky' ? 'bg-sky-500/90 text-white' : 'bg-amber-400/90 text-stone-900'
	);

	const removePillClass = $derived(
		variant === 'sky'
			? 'border border-sky-400/60 text-sky-800 hover:bg-sky-400/15 dark:text-sky-300'
			: 'border border-amber-400/60 text-amber-800 hover:bg-amber-400/15 dark:text-amber-300'
	);

	const showPills = $derived(genres.length > 0 || isAdmin);
	const pinAddForm = $derived(variant === 'sky' && isAdmin);
</script>

{#if pinAddForm}
	<div class="flex min-h-0 w-full flex-1 flex-col">
		{#if showPills}
			<div class="flex min-h-[1.375rem] w-full shrink-0 flex-wrap justify-center gap-1 px-1">
				{#each genres as genre (genre)}
					<form
						method="POST"
						{action}
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'failure') {
									toast.error(String(result.data?.message ?? 'Could not update genres.'));
								}
								await update({ reset: false });
							};
						}}
					>
						<input type="hidden" name="id" value={item.id} />
						<input type="hidden" name="genres" value={JSON.stringify(removeGenre(genres, genre))} />
						<button
							type="submit"
							class="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase transition-colors {removePillClass}"
							title="Remove {genre}"
						>
							{genre}
							<X size={9} weight="bold" aria-hidden="true" />
						</button>
					</form>
				{/each}
			</div>
		{/if}

		<div class="min-h-0 flex-1" aria-hidden="true"></div>

		<form
			method="POST"
			{action}
			class="mt-3 flex min-h-[1.875rem] w-full shrink-0 items-center justify-center gap-1 px-1"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'failure') {
						toast.error(String(result.data?.message ?? 'Could not add genre.'));
					} else if (newGenreInput.trim()) {
						toast.success(`Added genre "${newGenreInput.trim()}".`);
						newGenreInput = '';
					}
					await update({ reset: false });
				};
			}}
		>
			<input type="hidden" name="id" value={item.id} />
			<input type="hidden" name="genres" value={JSON.stringify(genres)} />
			<input
				type="text"
				name="newGenre"
				bind:value={newGenreInput}
				placeholder="Add genre"
				maxlength="50"
				class="input-round w-full max-w-[7rem] px-2.5 py-1 text-[10px]"
				aria-label="New genre name"
			/>
			<button
				type="submit"
				class="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-text-secondary))] transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400"
				title="Add genre"
				aria-label="Add genre"
			>
				<Plus size={12} weight="bold" />
			</button>
		</form>
	</div>
{:else}
	{#if showPills}
		<div class="mt-1.5 flex min-h-[1.375rem] w-full flex-wrap justify-center gap-1 px-1">
			{#each genres as genre (genre)}
				{#if isAdmin}
					<form
						method="POST"
						{action}
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'failure') {
									toast.error(String(result.data?.message ?? 'Could not update genres.'));
								}
								await update({ reset: false });
							};
						}}
					>
						<input type="hidden" name="id" value={item.id} />
						<input type="hidden" name="genres" value={JSON.stringify(removeGenre(genres, genre))} />
						<button
							type="submit"
							class="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase transition-colors {removePillClass}"
							title="Remove {genre}"
						>
							{genre}
							<X size={9} weight="bold" aria-hidden="true" />
						</button>
					</form>
				{:else}
					<span
						class="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase {activePillClass}"
					>
						{genre}
					</span>
				{/if}
			{/each}
		</div>
	{/if}

	{#if isAdmin}
		<form
			method="POST"
			{action}
			class="mt-1.5 flex min-h-[1.875rem] w-full items-center justify-center gap-1 px-1"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'failure') {
						toast.error(String(result.data?.message ?? 'Could not add genre.'));
					} else if (newGenreInput.trim()) {
						toast.success(`Added genre "${newGenreInput.trim()}".`);
						newGenreInput = '';
					}
					await update({ reset: false });
				};
			}}
		>
			<input type="hidden" name="id" value={item.id} />
			<input type="hidden" name="genres" value={JSON.stringify(genres)} />
			<input
				type="text"
				name="newGenre"
				bind:value={newGenreInput}
				placeholder="Add genre"
				maxlength="50"
				class="input-round w-full max-w-[7rem] px-2.5 py-1 text-[10px]"
				aria-label="New genre name"
			/>
			<button
				type="submit"
				class="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-text-secondary))] transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400"
				title="Add genre"
				aria-label="Add genre"
			>
				<Plus size={12} weight="bold" />
			</button>
		</form>
	{/if}
{/if}
