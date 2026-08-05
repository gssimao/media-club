<script lang="ts">
	import {
		Film,
		BookOpen,
		Disc3,
		Heart,
		ArrowRight,
		Shield,
		Search,
		Server,
		Sparkles
	} from '@lucide/svelte';

	let { data } = $props();

	const icons = {
		movie: Film,
		music: Disc3,
		book: BookOpen
	} as const;

	const features = [
		{
			icon: Film,
			title: 'Multi-format catalog',
			description: 'Track movies, vinyl records, and books in one unified, elegant interface.'
		},
		{
			icon: Search,
			title: 'Rich metadata',
			description: 'Auto-fetch cover art and details from TMDB, Discogs, and Open Library.'
		},
		{
			icon: Shield,
			title: 'Privacy first',
			description: 'Public browsing, admin-only edits. Your collection, your control.'
		},
		{
			icon: Server,
			title: 'Self-hosted',
			description: 'Run on Cloudflare or Docker. No subscriptions, no vendor lock-in.'
		}
	] as const;
</script>

<svelte:head>
	<title>Media Club — Self-hosted media inventory</title>
	<meta
		name="description"
		content="Free, self-hosted catalog for movies, vinyl, and books. Track owned titles and wishlists."
	/>
</svelte:head>

<section class="space-y-16 pb-8 sm:space-y-20 lg:space-y-24">
	<!-- Hero Section -->
	<div class="max-w-4xl space-y-6 pt-8 sm:pt-12 lg:pt-16">
		<div
			class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400"
		>
			<Sparkles class="size-3.5" />
			Self-hosted media inventory
		</div>
		
		<h1
			class="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
		>
			Your personal catalog for movies, vinyl, and books
		</h1>
		
		<p class="max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-zinc-400">
			Media Club is a beautifully simple app for tracking your physical media collection. Browse
			publicly, manage from an admin panel, and move wishlist items to your collection with one
			click.
		</p>
		
		<div class="flex flex-wrap gap-3 pt-4">
			<a
				href="/movies"
				class="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/40"
			>
				Browse catalog
				<ArrowRight class="size-4" />
			</a>
			<a
				href="/login"
				class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
			>
				Admin login
			</a>
		</div>
	</div>

	<!-- Features Grid -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each features as feature (feature.title)}
			{@const Icon = feature.icon}
			<article
				class="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
			>
				<div
					class="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-950 dark:text-blue-400"
				>
					<Icon class="size-5" />
				</div>
				<h2 class="mt-4 font-semibold text-slate-900 dark:text-white">{feature.title}</h2>
				<p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
					{feature.description}
				</p>
			</article>
		{/each}
	</div>

	<!-- Live Catalog Section -->
	<div class="space-y-6">
		<div>
			<div
				class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400"
			>
				Live catalog
			</div>
			<h2 class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Browse this instance</h2>
			<p class="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
				Each deployment maintains its own collection. These counts reflect what's stored on this
				server right now.
			</p>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			{#each data.summary as row (row.category)}
				{@const Icon = icons[row.category]}
				<article
					class="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
				>
					<div class="flex items-start gap-4">
						<div
							class="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
						>
							<Icon class="size-6" />
						</div>
						<div class="flex-1 min-w-0">
							<h3 class="text-lg font-semibold text-slate-900 dark:text-white">{row.label}</h3>
							<p class="mt-1 text-sm text-slate-600 dark:text-zinc-400">
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
							class="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
						>
							Collection
							<ArrowRight class="size-3.5" />
						</a>
						<a
							href="/wishlist/{row.category === 'movie' ? 'movies' : row.category}"
							class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
						>
							<Heart class="size-3.5" />
							Wishlist
						</a>
					</div>
				</article>
			{/each}
		</div>
	</div>

	<!-- Getting Started Section -->
	<div
		class="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/50 md:p-10"
	>
		<div
			class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400"
		>
			Get started
		</div>
		<h2 class="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
			Deploy your own Media Club
		</h2>
		<p class="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
			Clone the repository, configure environment variables, run migrations, and seed your admin
			account. Check
			<code
				class="rounded-md bg-slate-100 px-2 py-0.5 text-blue-600 dark:bg-zinc-800 dark:text-blue-400"
				>README.md</code
			>
			and
			<code
				class="rounded-md bg-slate-100 px-2 py-0.5 text-blue-600 dark:bg-zinc-800 dark:text-blue-400"
				>docs/</code
			>
			for detailed setup guides.
		</p>
		<div class="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
			<div
				class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"
			>
				<div
					class="flex size-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400"
				>
					1
				</div>
				<span class="font-medium text-slate-900 dark:text-white">Install deps</span>
			</div>
			<div
				class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"
			>
				<div
					class="flex size-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400"
				>
					2
				</div>
				<span class="font-medium text-slate-900 dark:text-white">Configure .env</span>
			</div>
			<div
				class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"
			>
				<div
					class="flex size-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400"
				>
					3
				</div>
				<span class="font-medium text-slate-900 dark:text-white">Run migrate</span>
			</div>
			<div
				class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"
			>
				<div
					class="flex size-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400"
				>
					4
				</div>
				<span class="font-medium text-slate-900 dark:text-white">Seed & start</span>
			</div>
		</div>
	</div>
</section>
