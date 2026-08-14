<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import { Plus, Clock } from 'phosphor-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Admin · Media Club</title>
</svelte:head>

<PageShell
	title="Admin"
	description="Welcome, {data.user
		?.username}. Add items from metadata APIs, manage notes, or move wishlist items into the collection."
>
	{#snippet controls()}
		<a href="/admin/search" class="btn-primary px-5 py-2.5 text-sm">
			<Plus size={16} weight="bold" />
			Add from search
		</a>
	{/snippet}

	<div class="surface-round p-6">
		<div class="flex items-center gap-2">
			<span
				class="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--color-accent-light))] dark:bg-stone-900"
			>
				<Clock
					size={20}
					weight="bold"
					class="text-[rgb(var(--color-text-secondary))] dark:text-stone-400"
				/>
			</span>
			<h2 class="text-lg font-black text-stone-900 uppercase dark:text-amber-50">Recent changes</h2>
		</div>
		{#if data.recent.length === 0}
			<p class="mt-4 text-sm font-medium text-stone-600 dark:text-stone-400">
				No items yet. Use search to add your first entry.
			</p>
		{:else}
			<ul class="mt-4 space-y-2">
				{#each data.recent as item (item.id)}
					<li
						class="flex items-center justify-between gap-4 rounded-[2rem] bg-[rgb(var(--color-surface))] px-4 py-3 dark:bg-stone-900/50"
					>
						<div class="min-w-0 flex-1">
							<p class="truncate font-bold text-stone-900 dark:text-amber-50">{item.title}</p>
							<p class="mt-0.5 text-xs font-medium text-stone-600 dark:text-stone-400">
								{item.category} · {item.listType} · {item.updatedAt.toLocaleString('en-US', {
									month: 'short',
									day: 'numeric',
									hour: 'numeric',
									minute: '2-digit'
								})}
							</p>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</PageShell>
