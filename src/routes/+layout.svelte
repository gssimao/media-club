<script lang="ts">
	import './layout.css';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { data, children } = $props();
</script>

{#if data.pathname !== '/'}
	<SiteHeader user={data.user} pathname={data.pathname} />
{/if}

<main
	class="pb-8 {data.pathname === '/'
		? 'mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8'
		: 'app-main--shell w-full max-w-none pr-4 sm:pr-6 lg:pr-8'}"
>
	{@render children()}
</main>

<footer
	class="mt-8 rounded-t-[2rem] border-t border-amber-400/80 bg-stone-100 py-8 text-center text-sm font-bold text-stone-700 dark:border-amber-500/60 dark:bg-stone-900 dark:text-stone-400"
>
	<p class="tracking-wide uppercase">Media Club — Free, self-hosted media inventory</p>
</footer>
