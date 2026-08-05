<script lang="ts">
	import './layout.css';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { data, children } = $props();
</script>

<SiteHeader user={data.user} pathname={data.pathname} />

<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	{@render children()}
</main>

<footer class="border-t border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
	<p>Media Club — Free, self-hosted media inventory</p>
</footer>
