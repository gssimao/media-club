<script lang="ts">
	import { Plus, Search } from '@lucide/svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Admin · Media Club</title>
</svelte:head>

<section class="space-y-8">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="text-sm text-indigo-300">Admin</p>
			<h1 class="text-3xl font-semibold">Welcome, {data.user?.username}</h1>
			<p class="mt-2 text-sm text-slate-400">
				Add items from free metadata APIs, edit notes, remove entries, or move wishlist items into
				your collection.
			</p>
		</div>

		<a
			href="/admin/search"
			class="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-400"
		>
			<Plus class="size-4" />
			Add from search
		</a>
	</div>

	<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6">
		<h2 class="text-lg font-semibold">Recent changes</h2>
		{#if data.recent.length === 0}
			<p class="mt-3 text-sm text-slate-400">No items yet. Use search to add your first entry.</p>
		{:else}
			<ul class="mt-4 space-y-3">
				{#each data.recent as item (item.id)}
					<li
						class="flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0"
					>
						<div>
							<p class="font-medium">{item.title}</p>
							<p class="text-xs text-slate-400">
								{item.category} · {item.listType} · {item.updatedAt.toLocaleString()}
							</p>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<a
		href="/admin/search"
		class="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
	>
		<Search class="size-4" />
		Open search panel
	</a>
</section>
