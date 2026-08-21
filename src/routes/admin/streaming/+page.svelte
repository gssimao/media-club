<script lang="ts">
	import { enhance } from '$app/forms';
	import PageShell from '$lib/components/PageShell.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import CoverImage from '$lib/components/CoverImage.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import { FilmStrip, Plus, Television, Trash } from 'phosphor-svelte';

	let { data } = $props();

	let showCreateForm = $state(false);
	let deleteTarget = $state<{ id: string; title: string } | null>(null);
	let deleteForm: HTMLFormElement | undefined = $state();
	let hoveredListId = $state<string | null>(null);
</script>

<svelte:head>
	<title>Streaming lists · Admin · Media Club</title>
</svelte:head>

<PageShell
	title="Streaming lists"
	description="Separate movie queues for random picks — not part of your owned collection. Reachable only from Admin."
>
	{#snippet controls()}
		<NavLink href="/admin" variant="accent">← Back to admin</NavLink>
		<button
			type="button"
			class="control-pill control-pill--primary"
			onclick={() => (showCreateForm = !showCreateForm)}
		>
			<Plus size={16} weight="bold" />
			New streaming list
		</button>
	{/snippet}

	{#if showCreateForm}
		<form
			method="POST"
			action="?/createList"
			class="surface-round mb-6 space-y-4 p-5"
			use:enhance={() => {
				return async ({ update }) => {
					showCreateForm = false;
					await update();
				};
			}}
		>
			<label class="block space-y-1 text-sm">
				<span class="font-bold text-stone-700 dark:text-stone-300">List title</span>
				<input
					type="text"
					name="title"
					required
					placeholder="Netflix tonight"
					class="input-round w-full"
				/>
			</label>
			<label class="block space-y-1 text-sm">
				<span class="font-bold text-stone-700 dark:text-stone-300">Description (optional)</span>
				<input
					type="text"
					name="description"
					placeholder="Movies available on streaming"
					class="input-round w-full"
				/>
			</label>
			<div class="flex gap-2">
				<button type="submit" class="btn-primary px-4 py-2 text-sm">Create list</button>
				<button
					type="button"
					class="btn-secondary px-4 py-2 text-sm"
					onclick={() => (showCreateForm = false)}
				>
					Cancel
				</button>
			</div>
		</form>
	{/if}

	{#if data.lists.length === 0}
		<div class="surface-round p-8 text-center">
			<Television size={40} weight="bold" class="mx-auto text-sky-500 dark:text-sky-400" />
			<p class="mt-4 text-sm font-medium text-stone-600 dark:text-stone-400">
				No streaming lists yet. Create one to build a random-watch queue separate from your
				collection.
			</p>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.lists as list (list.id)}
				{@const coverUrl = data.coverUrls[list.id]}
				<article class="surface-round relative overflow-hidden p-4">
					<a
						href="/admin/streaming/{list.id}"
						class="block"
						onmouseenter={() => (hoveredListId = list.id)}
						onmouseleave={() => (hoveredListId = null)}
					>
						<div
							class="mb-3 aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-[rgb(var(--color-bg))] dark:bg-stone-900"
						>
							{#if coverUrl}
								<CoverImage
									src={coverUrl}
									alt=""
									class="h-full w-full object-cover"
									hovered={hoveredListId === list.id}
								/>
							{:else}
								<div
									class="flex h-full items-center justify-center text-[rgb(var(--color-text-tertiary))]"
								>
									<FilmStrip size={36} weight="bold" />
								</div>
							{/if}
						</div>
						<h2 class="line-clamp-2 text-sm font-bold text-stone-900 dark:text-amber-50">
							{list.title}
						</h2>
						{#if list.description}
							<p class="mt-1 line-clamp-2 text-xs text-stone-600 dark:text-stone-400">
								{list.description}
							</p>
						{/if}
						<p class="mt-2 text-xs font-bold text-sky-700 dark:text-sky-400">
							{data.itemCounts[list.id] ?? 0} movies
						</p>
					</a>
					<button
						type="button"
						class="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full border border-red-400/80 bg-[rgb(var(--color-surface-raised))] text-red-700 shadow-sm hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
						aria-label="Delete {list.title}"
						onclick={() => (deleteTarget = { id: list.id, title: list.title })}
					>
						<Trash size={14} weight="bold" />
					</button>
				</article>
			{/each}
		</div>
	{/if}
</PageShell>

<form
	bind:this={deleteForm}
	method="POST"
	action="?/deleteList"
	class="hidden"
	use:enhance={() => {
		return async ({ update }) => {
			deleteTarget = null;
			await update();
		};
	}}
>
	<input type="hidden" name="id" value={deleteTarget?.id ?? ''} />
</form>

<ConfirmDialog
	open={deleteTarget !== null}
	title="Delete streaming list?"
	message={deleteTarget ? `Remove "${deleteTarget.title}" and all its movies?` : ''}
	confirmLabel="Delete"
	cancelLabel="Keep it"
	variant="danger"
	onCancel={() => (deleteTarget = null)}
	onConfirm={() => deleteForm?.requestSubmit()}
/>
