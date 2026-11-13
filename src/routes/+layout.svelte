<script lang="ts">
	import './layout.css';
	import AlbumDetailLoading from '$lib/components/AlbumDetailLoading.svelte';
	import AlbumLibraryLoading from '$lib/components/AlbumLibraryLoading.svelte';
	import CatalogPageLoading from '$lib/components/CatalogPageLoading.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import ToastHost from '$lib/components/ToastHost.svelte';
	import { getCatalogSkeletonConfig } from '$lib/utils/catalog-nav';
	import { navigating } from '$app/state';

	let { data, children } = $props();

	const skeletonConfig = $derived.by(() => {
		if (!navigating?.to) return null;
		// Same-page form actions (e.g. add from a modal) must not swap in the loading shell.
		if (navigating.from?.url.pathname === navigating.to.url.pathname) return null;
		return getCatalogSkeletonConfig(navigating.to.url.pathname);
	});
</script>

<a
	href="#main-content"
	class="btn-primary sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:z-[110] focus:-translate-x-1/2 focus:px-5 focus:py-2"
>
	Skip to content
</a>

<SiteHeader user={data.user} pathname={data.pathname} />

<main id="main-content" class="app-main">
	{#if skeletonConfig?.variant === 'album-detail'}
		<AlbumDetailLoading />
	{:else if skeletonConfig?.variant === 'album-library'}
		<AlbumLibraryLoading />
	{:else if skeletonConfig}
		<CatalogPageLoading title={skeletonConfig.title} showShelf={skeletonConfig.showShelf} />
	{:else}
		{#key data.pathname}
			<div class="anim-fade">
				{@render children()}
			</div>
		{/key}
	{/if}
</main>

<ToastHost />

<footer class="site-footer">
	<span>media club.</span>
	<p>A home for the things you love.</p>
	<a href="/settings">Make it yours</a>
</footer>
