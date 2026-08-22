<script lang="ts">
	import { enhance } from '$app/forms';
	import PageShell from '$lib/components/PageShell.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import StreamingListCard from '$lib/components/StreamingListCard.svelte';
	import { Plus, Television } from 'phosphor-svelte';

	let { data } = $props();

	let showCreateForm = $state(false);
	let deleteTarget = $state<{ id: string; title: string } | null>(null);
	let deleteForm: HTMLFormElement | undefined = $state();
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
		<div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each data.lists as list (list.id)}
				<StreamingListCard
					id={list.id}
					title={list.title}
					description={list.description}
					coverUrl={data.coverUrls[list.id]}
					itemCount={data.itemCounts[list.id] ?? 0}
					onDelete={() => (deleteTarget = { id: list.id, title: list.title })}
				/>
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
