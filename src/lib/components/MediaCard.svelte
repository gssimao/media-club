<script lang="ts">
	import type { MediaItem } from '$lib/types/media';
	import { ArrowRight, Pencil, Trash2, Check } from '@lucide/svelte';

	interface Props {
		item: MediaItem;
		isAdmin: boolean;
	}

	let { item, isAdmin }: Props = $props();

	const label = $derived(item.year ? `${item.title} (${item.year})` : item.title);
	let editingNotes = $state(false);
</script>

<article
	class="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900 {item.listType ===
	'wishlist'
		? 'border-dashed border-blue-300 dark:border-blue-800'
		: 'border-slate-200 dark:border-zinc-800'}"
>
	<div class="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-zinc-800">
		{#if item.listType === 'wishlist'}
			<div
				class="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur"
			>
				<span>Wishlist</span>
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
				class="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400 dark:text-zinc-600"
			>
				No cover available
			</div>
		{/if}

		<div
			class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
		></div>
	</div>

	<div class="flex flex-1 flex-col gap-3 p-4">
		<div class="flex-1">
			<h2 class="line-clamp-2 text-sm leading-snug font-semibold text-slate-900 dark:text-white">
				{item.title}
			</h2>
			{#if item.subtitle}
				<p class="mt-1.5 line-clamp-1 text-xs text-slate-600 dark:text-zinc-400">{item.subtitle}</p>
			{/if}
			{#if item.year}
				<p class="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-500">{item.year}</p>
			{/if}
		</div>

		{#if item.notes}
			<p
				class="line-clamp-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
			>
				{item.notes}
			</p>
		{/if}

		{#if isAdmin}
			<div class="mt-auto space-y-2 pt-2">
				{#if item.listType === 'wishlist'}
					<form method="POST" action="/admin/items?/moveToOwned">
						<input type="hidden" name="id" value={item.id} />
						<button
							type="submit"
							class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
						>
							<Check class="size-3.5" />
							Move to Collection
						</button>
					</form>
				{/if}

				<div class="flex gap-2">
					{#if !editingNotes}
						<button
							type="button"
							onclick={() => (editingNotes = true)}
							class="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
						>
							<Pencil class="size-3" />
							Notes
						</button>
					{/if}

					<form method="POST" action="/admin/items?/delete" class="flex-1">
						<input type="hidden" name="id" value={item.id} />
						<button
							type="submit"
							class="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950"
						>
							<Trash2 class="size-3" />
							Delete
						</button>
					</form>
				</div>

				{#if editingNotes}
					<form
						method="POST"
						action="/admin/items?/updateNotes"
						class="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-800"
					>
						<input type="hidden" name="id" value={item.id} />
						<textarea
							name="notes"
							rows="2"
							class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
							placeholder="Add notes about edition, condition, format…">{item.notes ?? ''}</textarea
						>
						<div class="flex gap-2">
							<button
								type="submit"
								class="flex-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
							>
								Save
							</button>
							<button
								type="button"
								onclick={() => (editingNotes = false)}
								class="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
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
