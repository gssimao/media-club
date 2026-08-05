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
class="group relative flex h-full flex-col overflow-hidden rounded border-2 bg-white transition-all hover:-translate-y-1 dark:bg-stone-800 {item.listType ===
'wishlist'
? 'border-dashed border-amber-400 dark:border-amber-500'
: 'border-stone-300 dark:border-stone-600'}"
>
<div class="relative aspect-[2/3] overflow-hidden bg-stone-100 dark:bg-stone-900">
{#if item.listType === 'wishlist'}
<div
class="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded bg-amber-400 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-stone-900"
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
class="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-stone-400 dark:text-stone-600"
>
No cover available
</div>
{/if}
</div>

<div class="flex flex-1 flex-col gap-3 border-t-2 border-amber-400 p-4 dark:border-amber-500">
<div class="flex-1">
<h2 class="line-clamp-2 text-sm font-bold leading-snug text-stone-900 dark:text-amber-50">
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
class="line-clamp-2 rounded border-2 border-stone-200 bg-stone-50 px-2.5 py-2 text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
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
class="inline-flex w-full items-center justify-center gap-1.5 rounded border-2 border-amber-500 bg-amber-400 px-3 py-2 text-xs font-black uppercase tracking-wide text-stone-900 transition-colors hover:bg-amber-500"
>
<Check class="size-3.5" strokeWidth={3} />
Move to Collection
</button>
</form>
{/if}

<div class="flex gap-2">
{#if !editingNotes}
<button
type="button"
onclick={() => (editingNotes = true)}
class="flex-1 inline-flex items-center justify-center gap-1 rounded border-2 border-stone-300 bg-white px-2.5 py-1.5 text-xs font-bold uppercase text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:bg-stone-700"
>
<Pencil class="size-3" strokeWidth={2.5} />
Notes
</button>
{/if}

<form method="POST" action="/admin/items?/delete" class="flex-1">
<input type="hidden" name="id" value={item.id} />
<button
type="submit"
class="inline-flex w-full items-center justify-center gap-1 rounded border-2 border-red-400 bg-white px-2.5 py-1.5 text-xs font-bold uppercase text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:bg-stone-800 dark:text-red-400 dark:hover:bg-red-950"
>
<Trash2 class="size-3" strokeWidth={2.5} />
Delete
</button>
</form>
</div>

{#if editingNotes}
<form
method="POST"
action="/admin/items?/updateNotes"
class="space-y-2 rounded border-2 border-stone-300 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-900"
>
<input type="hidden" name="id" value={item.id} />
<textarea
name="notes"
rows="2"
class="w-full rounded border-2 border-stone-300 bg-white px-2.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500"
placeholder="Add notes about edition, condition, format…">{item.notes ?? ''}</textarea
>
<div class="flex gap-2">
<button
type="submit"
class="flex-1 rounded border-2 border-amber-500 bg-amber-400 px-3 py-1.5 text-xs font-bold uppercase text-stone-900 hover:bg-amber-500"
>
Save
</button>
<button
type="button"
onclick={() => (editingNotes = false)}
class="flex-1 rounded border-2 border-stone-300 bg-white px-3 py-1.5 text-xs font-bold uppercase text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
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
