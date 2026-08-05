<script lang="ts">
	import './layout.css';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { data, children } = $props();
</script>

<SiteHeader user={data.user} pathname={data.pathname} />

<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	{@render children()}
</main>

<footer
	class="border-t-4 border-amber-400 bg-stone-100 py-8 text-center text-sm font-bold text-stone-700 dark:border-amber-500 dark:bg-stone-900 dark:text-stone-400"
>
	<p class="tracking-wide uppercase">Media Club — Free, self-hosted media inventory</p>
</footer>
