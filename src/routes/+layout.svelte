<script lang="ts">
	import './layout.css';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { data, children } = $props();
</script>

<SiteHeader user={data.user} pathname={data.pathname} />

<main class="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 lg:px-8">
	{@render children()}
</main>

<footer
	class="mt-8 rounded-t-[2rem] border-t border-amber-400/80 bg-stone-100 py-8 text-center text-sm font-bold text-stone-700 dark:border-amber-500/60 dark:bg-stone-900 dark:text-stone-400"
>
	<p class="tracking-wide uppercase">Media Club — Free, self-hosted media inventory</p>
</footer>
