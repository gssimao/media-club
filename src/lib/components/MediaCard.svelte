<script lang="ts">
	import type { MediaItem } from '$lib/types/media';
	import { Check, PencilSimple, Trash } from 'phosphor-svelte';

	interface Props {
		item: MediaItem;
		isAdmin: boolean;
	}

	let { item, isAdmin }: Props = $props();

	const label = $derived(item.year ? `${item.title} (${item.year})` : item.title);
	let editingNotes = $state(false);
</script>

<article
	class="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border bg-white transition-all hover:-translate-y-1 dark:bg-stone-800 {item.listType ===
	'wishlist'
		? 'border-dashed border-amber-400 dark:border-amber-500'
		: 'border-stone-300 dark:border-stone-600'}"
>
	<div class="relative m-3 aspect-[2/3] overflow-hidden rounded-[1.5rem] bg-stone-100 dark:bg-stone-900">
		{#if item.listType === 'wishlist'}
			<div
				class="absolute top-2 left-2 z-10 rounded-full bg-amber-400 px-3 py-1 text-xs font-black tracking-wide text-stone-900 uppercase"
			>
				Wishlist
			</div>
		{/if}

		{#if item.coverUrl}
			<img
				src={item.coverUrl}
				alt="{label} cover"
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				loading="lazy"
			/>
		{:else}
			<div
				class="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-stone-400 dark:text-stone-600"
			>
				No cover available
			</div>
		{/if}
	</div>

	<div class="flex flex-1 flex-col gap-3 px-4 pb-4">
		<div class="flex-1">
			<h2 class="line-clamp-2 text-sm leading-snug font-bold text-stone-900 dark:text-amber-50">
				{item.title}
			</h2>
			{#if item.subtitle}
				<p class="mt-1.5 line-clamp-1 text-xs font-medium text-stone-600 dark:text-stone-400">
					{item.subtitle}
				</p>
			{/if}
			{#if item.year}
				<p class="mt-1 text-xs font-bold text-amber-600 dark:text-amber-400">{item.year}</p>
			{/if}
		</div>

		{#if item.notes}
			<p
				class="line-clamp-2 rounded-[2rem] border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
			>
				{item.notes}
			</p>
		{/if}

		{#if isAdmin}
			<div class="mt-auto space-y-2 pt-2">
				{#if item.listType === 'wishlist'}
					<form method="POST" action="/admin/items?/moveToOwned">
						<input type="hidden" name="id" value={item.id} />
						<button type="submit" class="btn-primary w-full justify-center px-3 py-2 text-xs">
							<Check size={14} weight="bold" />
							Move to Collection
						</button>
					</form>
				{/if}

				<div class="flex gap-2">
					{#if !editingNotes}
						<button
							type="button"
							onclick={() => (editingNotes = true)}
							class="btn-secondary inline-flex flex-1 justify-center px-2.5 py-1.5 text-xs"
						>
							<PencilSimple size={12} weight="bold" />
							Notes
						</button>
					{/if}

					<form method="POST" action="/admin/items?/delete" class="flex-1">
						<input type="hidden" name="id" value={item.id} />
						<button
							type="submit"
							class="inline-flex w-full items-center justify-center gap-1 rounded-full border border-red-400 bg-white px-2.5 py-1.5 text-xs font-bold text-red-600 uppercase transition-colors hover:bg-red-50 dark:border-red-700 dark:bg-stone-800 dark:text-red-400 dark:hover:bg-red-950"
						>
							<Trash size={12} weight="bold" />
							Delete
						</button>
					</form>
				</div>

				{#if editingNotes}
					<form
						method="POST"
						action="/admin/items?/updateNotes"
						class="surface-round space-y-2 p-3"
					>
						<input type="hidden" name="id" value={item.id} />
						<textarea
							name="notes"
							rows="2"
							class="w-full rounded-[2rem] border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500"
							placeholder="Add notes about edition, condition, format…">{item.notes ?? ''}</textarea
						>
						<div class="flex gap-2">
							<button type="submit" class="btn-primary flex-1 justify-center px-3 py-1.5 text-xs">
								Save
							</button>
							<button
								type="button"
								onclick={() => (editingNotes = false)}
								class="btn-secondary flex-1 justify-center px-3 py-1.5 text-xs"
							>
								Cancel
							</button>
						</div>
					</form>
				{/if}
			</div>
		{/if}
	</div>
</article>
