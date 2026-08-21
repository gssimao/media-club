<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from '$lib/stores/toast.svelte';
	import {
		CATEGORY_LABELS,
		type CatalogStatus,
		type ListType,
		type MediaCategory,
		type SearchResult
	} from '$lib/types/media';
	import {
		BookOpen,
		Check,
		FilmStrip,
		Heart,
		MonitorPlay,
		Plus,
		VinylRecord
	} from 'phosphor-svelte';

	interface Props {
		result: SearchResult;
		category: MediaCategory;
		catalogStatus: CatalogStatus;
		onAdded?: (listType: ListType) => void;
	}

	let { result, category, catalogStatus, onAdded }: Props = $props();

	const collectionLabel = $derived(CATEGORY_LABELS[category]);

	function enhanceAdd(listType: ListType) {
		return () => {
			return async ({
				result: actionResult
			}: {
				result: { type: string; data?: { message?: unknown } };
			}) => {
				if (actionResult.type === 'failure') {
					toast.error(String(actionResult.data?.message ?? 'Could not add item.'));
					return;
				}

				if (actionResult.type === 'error') {
					toast.error('Could not add item.');
					return;
				}

				const destination = listType === 'owned' ? 'the collection' : 'the wishlist';
				toast.success(`Added "${result.title}" to ${destination}.`);
				onAdded?.(listType);

				// Never call update() — it applies redirect responses and remounts the page,
				// which closes modals and drops local search state. Refresh data in place instead.
				await invalidateAll();
			};
		};
	}
</script>

<div class="flex flex-wrap gap-2">
	{#if catalogStatus.owned}
		<span
			class="inline-flex items-center gap-1 rounded-full bg-stone-200/80 px-2.5 py-1.5 text-[10px] font-bold text-stone-600 dark:bg-stone-700 dark:text-stone-300"
			title="Already in {collectionLabel.toLowerCase()} collection"
		>
			<Check size={11} weight="bold" aria-hidden="true" />
			In collection
		</span>
	{:else}
		<form method="POST" action="/admin/items?/add" use:enhance={enhanceAdd('owned')}>
			<input type="hidden" name="category" value={category} />
			<input type="hidden" name="listType" value="owned" />
			<input type="hidden" name="externalId" value={result.externalId} />
			<input type="hidden" name="title" value={result.title} />
			<input type="hidden" name="subtitle" value={result.subtitle ?? ''} />
			<input type="hidden" name="year" value={result.year ?? ''} />
			<input type="hidden" name="coverUrl" value={result.coverUrl ?? ''} />
			<input
				type="hidden"
				name="metadata"
				value={result.metadata ? JSON.stringify(result.metadata) : ''}
			/>
			<button
				type="submit"
				class="btn-primary inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px]"
				title="Add to {collectionLabel} collection"
			>
				<Plus size={11} weight="bold" />
				Add
				{#if category === 'movie'}
					<FilmStrip size={11} weight="bold" aria-hidden="true" />
				{:else if category === 'show'}
					<MonitorPlay size={11} weight="bold" aria-hidden="true" />
				{:else if category === 'music'}
					<VinylRecord size={11} weight="bold" aria-hidden="true" />
				{:else}
					<BookOpen size={11} weight="bold" aria-hidden="true" />
				{/if}
			</button>
		</form>
	{/if}

	{#if catalogStatus.wishlist}
		<span
			class="inline-flex items-center gap-1 rounded-full bg-stone-200/80 px-2.5 py-1.5 text-[10px] font-bold text-stone-600 dark:bg-stone-700 dark:text-stone-300"
			title="Already on wishlist"
		>
			<Check size={11} weight="bold" aria-hidden="true" />
			On wishlist
		</span>
	{:else}
		<form method="POST" action="/admin/items?/add" use:enhance={enhanceAdd('wishlist')}>
			<input type="hidden" name="category" value={category} />
			<input type="hidden" name="listType" value="wishlist" />
			<input type="hidden" name="externalId" value={result.externalId} />
			<input type="hidden" name="title" value={result.title} />
			<input type="hidden" name="subtitle" value={result.subtitle ?? ''} />
			<input type="hidden" name="year" value={result.year ?? ''} />
			<input type="hidden" name="coverUrl" value={result.coverUrl ?? ''} />
			<input
				type="hidden"
				name="metadata"
				value={result.metadata ? JSON.stringify(result.metadata) : ''}
			/>
			<button
				type="submit"
				class="btn-secondary inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px]"
				title="Add to wishlist"
			>
				<Plus size={11} weight="bold" />
				Add
				<Heart size={11} weight="bold" aria-hidden="true" />
			</button>
		</form>
	{/if}
</div>
