<script lang="ts">
import { Film, BookOpen, Disc3, Heart, ArrowRight, Shield, Search, Server, Sparkles } from '@lucide/svelte';

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
description: 'Track movies, vinyl records, and books in one unified collection.'
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
class="inline-flex items-center gap-2 rounded-full border-2 border-amber-400 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-700 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-400"
>
<Sparkles class="size-3.5" strokeWidth={3} />
Self-hosted media inventory
</div>

<h1
class="text-4xl font-black uppercase tracking-tight text-stone-900 dark:text-amber-50 sm:text-5xl lg:text-6xl"
>
Your personal catalog for movies, vinyl, and books
</h1>

<p class="max-w-2xl text-lg font-medium leading-relaxed text-stone-700 dark:text-stone-300">
Media Club is a beautifully simple app for tracking your physical media collection. Browse
publicly, manage from an admin panel, and move wishlist items to your collection with one
click.
</p>

<div class="flex flex-wrap gap-3 pt-4">
<a
href="/movies"
class="inline-flex items-center gap-2 rounded border-2 border-amber-500 bg-amber-400 px-6 py-3 text-sm font-black uppercase tracking-wide text-stone-900 transition-all hover:bg-amber-500"
>
Browse catalog
<ArrowRight class="size-4" strokeWidth={3} />
</a>
<a
href="/login"
class="inline-flex items-center gap-2 rounded border-2 border-stone-300 bg-white px-6 py-3 text-sm font-black uppercase tracking-wide text-stone-700 transition-all hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
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
class="group rounded border-2 border-stone-300 bg-white p-6 transition-all hover:-translate-y-1 dark:border-stone-700 dark:bg-stone-800"
>
<div
class="inline-flex rounded bg-amber-400 p-3 text-stone-900 transition-transform group-hover:scale-110"
>
<Icon class="size-5" strokeWidth={2.5} />
</div>
<h2 class="mt-4 font-black uppercase text-stone-900 dark:text-white">{feature.title}</h2>
<p class="mt-2 text-sm font-medium leading-relaxed text-stone-600 dark:text-stone-400">
{feature.description}
</p>
</article>
{/each}
</div>

<!-- Live Catalog Section -->
<div class="space-y-6">
<div>
<div
class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400"
>
Live catalog
</div>
<h2 class="mt-2 text-3xl font-black uppercase text-stone-900 dark:text-white">
Browse this instance
</h2>
<p class="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-stone-700 dark:text-stone-400">
Each deployment maintains its own collection. These counts reflect what's stored on this
server right now.
</p>
</div>

<div class="grid gap-4 md:grid-cols-3">
{#each data.summary as row (row.category)}
{@const Icon = icons[row.category]}
<article
class="group rounded border-2 border-stone-300 bg-white p-6 transition-all hover:-translate-y-1 dark:border-stone-700 dark:bg-stone-800"
>
<div class="flex items-start gap-4">
<div class="rounded bg-amber-400 p-3 text-stone-900">
<Icon class="size-6" strokeWidth={2.5} />
</div>
<div class="flex-1 min-w-0">
<h3 class="text-lg font-black uppercase text-stone-900 dark:text-white">
{row.label}
</h3>
<p class="mt-1 text-sm font-bold text-stone-600 dark:text-stone-400">
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
class="inline-flex items-center gap-1.5 rounded border-2 border-amber-500 bg-amber-400 px-3 py-2 text-sm font-black uppercase text-stone-900 transition-colors hover:bg-amber-500"
>
Collection
<ArrowRight class="size-3.5" strokeWidth={3} />
</a>
<a
href="/wishlist/{row.category === 'movie' ? 'movies' : row.category}"
class="inline-flex items-center gap-1.5 rounded border-2 border-stone-300 bg-white px-3 py-2 text-sm font-bold uppercase text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
>
<Heart class="size-3.5" strokeWidth={2.5} />
Wishlist
</a>
</div>
</article>
{/each}
</div>
</div>

<!-- Getting Started Section -->
<div
class="rounded border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-white p-8 dark:border-amber-600 dark:from-stone-900 dark:to-stone-800 md:p-10"
>
<div
class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400"
>
Get started
</div>
<h2 class="mt-2 text-2xl font-black uppercase text-stone-900 dark:text-white">
Deploy your own Media Club
</h2>
<p class="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-stone-700 dark:text-stone-400">
Clone the repository, configure environment variables, run migrations, and seed your admin
account. Check
<code
class="rounded border-2 border-stone-300 bg-white px-2 py-0.5 font-bold text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
>README.md</code
>
and
<code
class="rounded border-2 border-stone-300 bg-white px-2 py-0.5 font-bold text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
>docs/</code
>
for detailed setup guides.
</p>
<div class="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
<div
class="flex items-center gap-3 rounded border-2 border-stone-300 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-800"
>
<div
class="flex size-6 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-stone-900"
>
1
</div>
<span class="font-bold uppercase text-stone-900 dark:text-white">Install deps</span>
</div>
<div
class="flex items-center gap-3 rounded border-2 border-stone-300 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-800"
>
<div
class="flex size-6 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-stone-900"
>
2
</div>
<span class="font-bold uppercase text-stone-900 dark:text-white">Configure .env</span>
</div>
<div
class="flex items-center gap-3 rounded border-2 border-stone-300 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-800"
>
<div
class="flex size-6 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-stone-900"
>
3
</div>
<span class="font-bold uppercase text-stone-900 dark:text-white">Run migrate</span>
</div>
<div
class="flex items-center gap-3 rounded border-2 border-stone-300 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-800"
>
<div
class="flex size-6 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-stone-900"
>
4
</div>
<span class="font-bold uppercase text-stone-900 dark:text-white">Seed & start</span>
</div>
</div>
</div>
</section>
