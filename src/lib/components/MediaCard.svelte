<script lang="ts">
	import type { MediaItem } from '$lib/types/media';
	import {
		FORMAT_TAG_PRESETS,
		getDisplayNotes,
		getDisplayTags,
		toggleTag
	} from '$lib/utils/format-tags';
	import { Check, PencilSimple, Trash } from 'phosphor-svelte';

	interface Props {
		item: MediaItem;
		isAdmin: boolean;
	}

	let { item, isAdmin }: Props = $props();

	const label = $derived(item.year ? `${item.title} (${item.year})` : item.title);
	const displayTags = $derived(getDisplayTags(item));
	const displayNotes = $derived(getDisplayNotes(item));
	const presetTags = $derived(FORMAT_TAG_PRESETS[item.category]);

	let editingNotes = $state(false);
</script>

<article class="group mx-auto flex w-full max-w-[15rem] flex-col items-center">
	<!-- Year + delete — outside the circle -->
	<div class="mb-1 flex min-h-7 w-full items-center justify-between px-0.5">
		{#if item.year}
			<span
				class="text-xs font-black tracking-widest text-amber-600 tabular-nums dark:text-amber-400"
			>
				{item.year}
			</span>
		{:else}
			<span aria-hidden="true"></span>
		{/if}

		{#if isAdmin}
			<form method="POST" action="/admin/items?/delete">
				<input type="hidden" name="id" value={item.id} />
				<button
					type="submit"
					class="inline-flex size-7 items-center justify-center rounded-full border border-red-400/80 bg-white text-red-600 shadow-sm transition-colors hover:bg-red-50 dark:border-red-700 dark:bg-stone-900 dark:text-red-400 dark:hover:bg-red-950"
					aria-label="Delete {item.title}"
				>
					<Trash size={13} weight="bold" />
				</button>
			</form>
		{/if}
	</div>

	<!-- Simple circle frame — cover only inside -->
	<div
		class="relative aspect-square w-[13rem] shrink-0 overflow-hidden rounded-full border-2 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md sm:w-[15rem] dark:bg-stone-800 {item.listType ===
		'wishlist'
			? 'border-dashed border-amber-400 dark:border-amber-500'
			: 'border-amber-400/40 dark:border-amber-500/35'}"
	>
		{#if item.listType === 'wishlist'}
			<div
				class="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-amber-400 px-2.5 py-0.5 text-[9px] font-black tracking-wide text-stone-900 uppercase"
			>
				Wishlist
			</div>
		{/if}

		<div class="absolute inset-0 flex items-center justify-center">
			<div
				class="aspect-[2/3] w-[58%] overflow-hidden rounded-[1.5rem] bg-stone-100 dark:bg-stone-900"
			>
				{#if item.coverUrl}
					<img
						src={item.coverUrl}
						alt="{label} cover"
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
				{:else}
					<div
						class="flex h-full items-center justify-center px-2 text-center text-[10px] font-semibold text-stone-400 dark:text-stone-600"
					>
						No cover
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Title + subtitle — below circle -->
	<div class="mt-2.5 w-full px-1 text-center">
		<h2 class="line-clamp-2 text-xs leading-snug font-bold text-stone-900 dark:text-amber-50">
			{item.title}
		</h2>
		{#if item.subtitle}
			<p class="mt-0.5 line-clamp-1 text-[11px] font-medium text-stone-600 dark:text-stone-400">
				{item.subtitle}
			</p>
		{/if}
	</div>

	<!-- Format tags — below title, outside circle -->
	{#if isAdmin || displayTags.length > 0}
		<div class="mt-2 flex w-full flex-wrap justify-center gap-1 px-1">
			{#if isAdmin}
				{#each presetTags as tag (tag)}
					{@const active = displayTags.includes(tag)}
					<form method="POST" action="/admin/items?/updateTags">
						<input type="hidden" name="id" value={item.id} />
						<input
							type="hidden"
							name="tags"
							value={JSON.stringify(toggleTag(displayTags, tag))}
						/>
						<button
							type="submit"
							class="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase transition-colors {active
								? 'bg-amber-400 text-stone-900'
								: 'border border-dashed border-stone-300 text-stone-500 hover:border-amber-400 hover:text-amber-600 dark:border-stone-600 dark:text-stone-400 dark:hover:border-amber-500 dark:hover:text-amber-400'}"
						>
							{tag}
						</button>
					</form>
				{/each}
			{:else}
				{#each displayTags as tag (tag)}
					<span
						class="rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold tracking-wide text-stone-900 uppercase"
					>
						{tag}
					</span>
				{/each}
			{/if}
		</div>
	{/if}

	{#if displayNotes}
		<p
			class="mt-2 line-clamp-2 w-full rounded-[2rem] border border-stone-200 bg-stone-50 px-3 py-2 text-center text-[10px] text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
		>
			{displayNotes}
		</p>
	{/if}

	{#if isAdmin}
		<div class="mt-2 w-full space-y-2">
			{#if item.listType === 'wishlist'}
				<form method="POST" action="/admin/items?/moveToOwned">
					<input type="hidden" name="id" value={item.id} />
					<button type="submit" class="btn-primary w-full justify-center px-3 py-1.5 text-[10px]">
						<Check size={12} weight="bold" />
						Move to Collection
					</button>
				</form>
			{/if}

			{#if !editingNotes}
				<button
					type="button"
					onclick={() => (editingNotes = true)}
					class="btn-secondary inline-flex w-full justify-center px-2.5 py-1.5 text-[10px]"
				>
					<PencilSimple size={11} weight="bold" />
					Notes
				</button>
			{/if}

			{#if editingNotes}
				<form method="POST" action="/admin/items?/updateNotes" class="surface-round space-y-2 p-3">
					<input type="hidden" name="id" value={item.id} />
					<textarea
						name="notes"
						rows="2"
						class="w-full rounded-[2rem] border border-stone-300 bg-white px-3 py-2 text-[10px] text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500"
						placeholder="Edition, condition, personal notes…">{item.notes ?? ''}</textarea
					>
					<div class="flex gap-2">
						<button type="submit" class="btn-primary flex-1 justify-center px-3 py-1.5 text-[10px]">
							Save
						</button>
						<button
							type="button"
							onclick={() => (editingNotes = false)}
							class="btn-secondary flex-1 justify-center px-3 py-1.5 text-[10px]"
						>
							Cancel
						</button>
					</div>
				</form>
			{/if}
		</div>
	{/if}
</article>
