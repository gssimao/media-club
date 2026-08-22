<script lang="ts">
	import CoverImage from './CoverImage.svelte';
	import { FilmStrip, Trash } from 'phosphor-svelte';

	interface Props {
		id: string;
		title: string;
		description?: string | null;
		coverUrl?: string | null;
		itemCount: number;
		onDelete: () => void;
	}

	let { id, title, description = null, coverUrl = null, itemCount, onDelete }: Props = $props();

	let hovered = $state(false);
</script>

<article class="surface-round relative mx-auto w-full max-w-[9.5rem] overflow-hidden p-3">
	<a
		href="/admin/streaming/{id}"
		class="block"
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
	>
		<div
			class="mb-2 aspect-[2/3] overflow-hidden rounded-[1.5rem] bg-[rgb(var(--color-bg))] dark:bg-stone-900"
		>
			{#if coverUrl}
				<CoverImage src={coverUrl} alt="" class="h-full w-full object-cover" {hovered} />
			{:else}
				<div class="flex h-full items-center justify-center text-[rgb(var(--color-text-tertiary))]">
					<FilmStrip size={28} weight="bold" />
				</div>
			{/if}
		</div>
		<h2 class="line-clamp-2 text-xs font-bold text-stone-900 dark:text-amber-50">
			{title}
		</h2>
		{#if description}
			<p class="mt-0.5 line-clamp-2 text-[10px] leading-snug text-stone-600 dark:text-stone-400">
				{description}
			</p>
		{/if}
		<p class="mt-1.5 text-[10px] font-bold text-sky-700 dark:text-sky-400">
			{itemCount === 1 ? '1 movie' : `${itemCount} movies`}
		</p>
	</a>
	<button
		type="button"
		class="absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-full border border-red-400/80 bg-[rgb(var(--color-surface-raised))] text-red-700 shadow-sm hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
		aria-label="Delete {title}"
		onclick={onDelete}
	>
		<Trash size={12} weight="bold" />
	</button>
</article>
