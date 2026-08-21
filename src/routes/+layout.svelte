<script lang="ts">
	import './layout.css';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import ToastHost from '$lib/components/ToastHost.svelte';
	import VinylDisc from '$lib/components/VinylDisc.svelte';

	let { data, children } = $props();
</script>

<a
	href="#main-content"
	class="btn-primary sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:z-[100] focus:-translate-x-1/2 focus:px-5 focus:py-2"
>
	Skip to content
</a>

{#if data.pathname !== '/'}
	<SiteHeader user={data.user} pathname={data.pathname} />
{/if}

<main
	id="main-content"
	class="pb-8 {data.pathname === '/'
		? 'mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8'
		: 'app-main--shell w-full max-w-none px-4 sm:px-6 lg:px-8'}"
>
	{#key data.pathname}
		<div class="anim-fade">
			{@render children()}
		</div>
	{/key}
</main>

<ToastHost />

<footer
	class="mt-8 rounded-t-[2rem] border-t border-amber-400/80 bg-[rgb(var(--color-surface))] py-8 text-center text-sm font-bold text-[rgb(var(--color-text-secondary))] dark:border-amber-500/60"
>
	<div class="flex items-center justify-center gap-3">
		<VinylDisc spinning class="size-6 opacity-80" />
		<p class="tracking-wide uppercase">Media Club — Free, self-hosted media inventory</p>
		<VinylDisc spinning class="size-6 opacity-80" />
	</div>
</footer>
