<script lang="ts">
	import type { MediaItem } from '$lib/types/media';
	import { ArrowRight, Pencil, Trash2 } from '@lucide/svelte';

	interface Props {
		item: MediaItem;
		isAdmin: boolean;
	}

	let { item, isAdmin }: Props = $props();

	const label = $derived(item.year ? `${item.title} (${item.year})` : item.title);
</script>

<article
	class="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-lg transition hover:-translate-y-0.5 hover:border-indigo-400/40 {item.listType ===
	'wishlist'
		? 'border-dashed'
		: ''}"
>
	<div class="relative aspect-[2/3] overflow-hidden bg-slate-800">
		{#if item.listType === 'wishlist'}
			<span
				class="absolute top-2 left-2 z-10 rounded-md bg-black/70 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-indigo-200 uppercase"
			>
				Wishlist
			</span>
		{/if}

		{#if item.coverUrl}
			<img
				src={item.coverUrl}
				alt="{label} cover"
				class="h-full w-full object-cover"
				loading="lazy"
			/>
		{:else}
			<div class="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
				No cover
			</div>
		{/if}
	</div>

	<div class="flex flex-1 flex-col gap-3 p-4">
		<div>
			<h2 class="line-clamp-2 text-sm leading-5 font-semibold">{item.title}</h2>
			{#if item.subtitle}
				<p class="mt-1 line-clamp-1 text-xs text-slate-400">{item.subtitle}</p>
			{/if}
			{#if item.year}
				<p class="mt-1 text-xs text-slate-500">{item.year}</p>
			{/if}
		</div>

		{#if item.notes}
			<p class="line-clamp-2 text-xs text-slate-400">{item.notes}</p>
		{/if}

		{#if isAdmin}
			<div class="mt-auto flex flex-wrap gap-2">
				{#if item.listType === 'wishlist'}
					<form method="POST" action="/admin/items?/moveToOwned" class="flex-1">
						<input type="hidden" name="id" value={item.id} />
						<button
							type="submit"
							class="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-indigo-500 px-2 py-1.5 text-xs font-medium text-white hover:bg-indigo-400"
						>
							<ArrowRight class="size-3.5" />
							Move to collection
						</button>
					</form>
				{/if}

				<details class="w-full">
					<summary
						class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5"
					>
						<Pencil class="size-3.5" />
						Edit notes
					</summary>
					<form method="POST" action="/admin/items?/updateNotes" class="mt-2 space-y-2">
						<input type="hidden" name="id" value={item.id} />
						<textarea
							name="notes"
							rows="2"
							class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-xs"
							placeholder="Edition, condition, format…">{item.notes ?? ''}</textarea
						>
						<button
							type="submit"
							class="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
						>
							Save
						</button>
					</form>
				</details>

				<form method="POST" action="/admin/items?/delete">
					<input type="hidden" name="id" value={item.id} />
					<button
						type="submit"
						class="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
					>
						<Trash2 class="size-3.5" />
						Remove
					</button>
				</form>
			</div>
		{/if}
	</div>
</article>
