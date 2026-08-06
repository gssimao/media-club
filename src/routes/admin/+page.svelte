<script lang="ts">
	import { Plus, MagnifyingGlass, Clock } from 'phosphor-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Admin · Media Club</title>
</svelte:head>

<section class="space-y-8">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<div
				class="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-black tracking-wider text-amber-700 uppercase dark:text-amber-400"
			>
				Admin Panel
			</div>
			<h1 class="mt-3 text-3xl font-black text-stone-900 uppercase dark:text-amber-50">
				Welcome, {data.user?.username}
			</h1>
			<p class="mt-2 text-sm font-medium text-stone-700 dark:text-stone-300">
				Add items from metadata APIs, manage notes, or move wishlist items into the collection.
			</p>
		</div>

		<a href="/admin/search" class="btn-primary px-5 py-2.5 text-sm">
			<Plus size={16} weight="bold" />
			Add from search
		</a>
	</div>

	<div class="surface-round p-6">
		<div class="flex items-center gap-2">
			<span class="flex size-10 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-900">
				<Clock size={20} weight="bold" class="text-stone-600 dark:text-stone-400" />
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
						class="flex items-center justify-between gap-4 rounded-[2rem] bg-stone-50 px-4 py-3 dark:bg-stone-900/50"
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
		class="pill-nav text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-stone-800"
	>
		<MagnifyingGlass size={16} weight="bold" />
		Open search panel
	</a>
</section>
