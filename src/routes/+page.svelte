<script lang="ts">
	import { Film, BookOpen, Disc3, Heart, ArrowRight } from '@lucide/svelte';

	let { data } = $props();

	const icons = {
		movie: Film,
		music: Disc3,
		book: BookOpen
	} as const;
</script>

<svelte:head>
	<title>Media Club</title>
	<meta
		name="description"
		content="Track movies, vinyl records, and books you own — plus wishlists for what you want next."
	/>
</svelte:head>

<section class="space-y-10">
	<div class="max-w-2xl space-y-4">
		<p class="text-sm font-medium tracking-[0.2em] text-indigo-300 uppercase">Home media catalog</p>
		<h1 class="text-4xl font-semibold tracking-tight md:text-5xl">
			What you own. What you want next.
		</h1>
		<p class="text-lg text-slate-400">
			Media Club is an easy reference for movies, records, and books at home — with separate
			wishlists and one-click moves when you finally buy something.
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		{#each data.summary as row (row.category)}
			{@const Icon = icons[row.category]}
			<article
				class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6"
			>
				<div class="flex items-center gap-3">
					<div class="rounded-xl bg-indigo-500/15 p-3 text-indigo-300">
						<Icon class="size-6" />
					</div>
					<div>
						<h2 class="text-lg font-semibold">{row.label}</h2>
						<p class="text-sm text-slate-400">
							{row.owned} owned · {row.wishlist} wishlist
						</p>
					</div>
				</div>

				<div class="mt-6 flex flex-wrap gap-2">
					<a
						href="/{row.category === 'movie'
							? 'movies'
							: row.category === 'music'
								? 'music'
								: 'books'}"
						class="inline-flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
					>
						View collection
						<ArrowRight class="size-4" />
					</a>
					<a
						href="/wishlist/{row.category === 'movie' ? 'movies' : row.category}"
						class="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
					>
						<Heart class="size-4" />
						Wishlist
					</a>
				</div>
			</article>
		{/each}
	</div>
</section>
