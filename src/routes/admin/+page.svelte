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
				class="inline-flex items-center gap-2 text-xs font-black tracking-wider text-amber-600 uppercase dark:text-amber-400"
			>
				Admin Panel
			</div>
			<h1 class="mt-1 text-3xl font-black text-stone-900 uppercase dark:text-amber-50">
				Welcome, {data.user?.username}
			</h1>
			<p class="mt-2 text-sm font-medium text-stone-700 dark:text-stone-300">
				Add items from metadata APIs, manage notes, or move wishlist items into your collection.
			</p>
		</div>

		<a
			href="/admin/search"
			class="inline-flex items-center gap-2 rounded border-2 border-amber-500 bg-amber-400 px-5 py-2.5 text-sm font-black tracking-wide text-stone-900 uppercase transition-all hover:bg-amber-500"
		>
			<Plus class="size-4" strokeWidth={3} />
			Add from search
		</a>
	</div>

	<div
		class="rounded border-2 border-stone-300 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
	>
		<div class="flex items-center gap-2">
			<Clock class="size-5 text-stone-600 dark:text-stone-400" strokeWidth={2.5} />
			<h2 class="text-lg font-black text-stone-900 uppercase dark:text-amber-50">Recent changes</h2>
		</div>
		{#if data.recent.length === 0}
			<p class="mt-4 text-sm font-medium text-stone-600 dark:text-stone-400">
				No items yet. Use search to add your first entry.
			</p>
		{:else}
			<ul class="mt-4 space-y-3">
				{#each data.recent as item (item.id)}
					<li
						class="flex items-center justify-between gap-4 border-b-2 border-stone-100 pb-3 last:border-0 last:pb-0 dark:border-stone-700"
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

	<a
		href="/admin/search"
		class="inline-flex items-center gap-2 text-sm font-bold text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
	>
		<Search class="size-4" strokeWidth={2.5} />
		Open search panel
	</a>
</section>
