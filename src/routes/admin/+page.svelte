<script lang="ts">
	import { Plus, Search, Clock } from '@lucide/svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Admin · Media Club</title>
</svelte:head>

<section class="space-y-8">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<div
				class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400"
			>
				Admin Panel
			</div>
			<h1 class="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
				Welcome, {data.user?.username}
			</h1>
			<p class="mt-2 text-sm text-slate-600 dark:text-zinc-400">
				Add items from metadata APIs, manage notes, or move wishlist items into your collection.
			</p>
		</div>

		<a
			href="/admin/search"
			class="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/40"
		>
			<Plus class="size-4" />
			Add from search
		</a>
	</div>

	<div
		class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
	>
		<div class="flex items-center gap-2">
			<Clock class="size-5 text-slate-600 dark:text-zinc-400" />
			<h2 class="text-lg font-semibold text-slate-900 dark:text-white">Recent changes</h2>
		</div>
		{#if data.recent.length === 0}
			<p class="mt-4 text-sm text-slate-600 dark:text-zinc-400">
				No items yet. Use search to add your first entry.
			</p>
		{:else}
			<ul class="mt-4 space-y-3">
				{#each data.recent as item (item.id)}
					<li
						class="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-zinc-800"
					>
						<div class="min-w-0 flex-1">
							<p class="truncate font-medium text-slate-900 dark:text-white">{item.title}</p>
							<p class="mt-0.5 text-xs text-slate-600 dark:text-zinc-400">
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

	<a
		href="/admin/search"
		class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
	>
		<Search class="size-4" />
		Open search panel
	</a>
</section>
