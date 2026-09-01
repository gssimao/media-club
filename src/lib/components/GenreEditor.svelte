<script lang="ts">
	import GenrePickerDialog from './GenrePickerDialog.svelte';
	import { getDisplayGenres } from '$lib/utils/movie-genres';
	import type { MediaItem } from '$lib/types/media';
	import type { TmdbGenreCategory } from '$lib/utils/movie-genres';
	import { Tag } from 'phosphor-svelte';

	interface Props {
		item: Pick<MediaItem, 'id' | 'metadata' | 'title'>;
		action: string;
		isAdmin: boolean;
		/** Sky tint for streaming cards; amber for catalog movies. */
		variant?: 'sky' | 'amber';
		catalogItems?: { metadata: Record<string, unknown> | null }[];
		category?: TmdbGenreCategory;
		deleteCustomGenreAction?: string;
	}

	let {
		item,
		action,
		isAdmin,
		variant = 'amber',
		catalogItems = [],
		category = 'movie',
		deleteCustomGenreAction
	}: Props = $props();

	const genres = $derived(getDisplayGenres(item));
	let showPicker = $state(false);

	const activePillClass = $derived(
		variant === 'sky' ? 'bg-sky-500/90 text-white' : 'bg-amber-400/90 text-stone-900'
	);

	const showPills = $derived(genres.length > 0 || isAdmin);
	const pinEditControl = $derived(variant === 'sky' && isAdmin);
</script>

{#if pinEditControl}
	<div class="flex min-h-0 w-full flex-1 flex-col">
		{#if showPills}
			<div class="flex min-h-[1.375rem] w-full shrink-0 flex-wrap justify-center gap-1 px-1">
				{#each genres as genre (genre)}
					<span
						class="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase {activePillClass}"
					>
						{genre}
					</span>
				{/each}
			</div>
		{/if}

		<div class="min-h-0 flex-1" aria-hidden="true"></div>

		<div class="mt-3 flex min-h-[1.875rem] w-full shrink-0 justify-center px-1">
			<button
				type="button"
				class="inline-flex items-center gap-1 rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] px-3 py-1 text-[10px] font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase transition-colors hover:border-sky-500 hover:text-sky-700 dark:hover:border-sky-400 dark:hover:text-sky-300"
				title="Edit genres"
				aria-label="Edit genres for {item.title}"
				onclick={() => (showPicker = true)}
			>
				<Tag size={12} weight="bold" />
				Genres
			</button>
		</div>
	</div>
{:else}
	{#if showPills}
		<div class="mt-1.5 flex min-h-[1.375rem] w-full flex-wrap justify-center gap-1 px-1">
			{#each genres as genre (genre)}
				<span
					class="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase {activePillClass}"
				>
					{genre}
				</span>
			{/each}
		</div>
	{/if}

	{#if isAdmin}
		<div class="mt-1.5 flex min-h-[1.875rem] w-full items-center justify-center px-1">
			<button
				type="button"
				class="inline-flex items-center gap-1 rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] px-3 py-1 text-[10px] font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400"
				title="Edit genres"
				aria-label="Edit genres for {item.title}"
				onclick={() => (showPicker = true)}
			>
				<Tag size={12} weight="bold" />
				{#if genres.length === 0}
					Add genres
				{:else}
					Edit
				{/if}
			</button>
		</div>
	{/if}
{/if}

{#if showPicker}
	<GenrePickerDialog
		{item}
		{action}
		{variant}
		{catalogItems}
		{category}
		{deleteCustomGenreAction}
		onClose={() => (showPicker = false)}
	/>
{/if}
