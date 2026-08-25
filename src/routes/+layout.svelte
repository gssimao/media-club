<script lang="ts">
	import './layout.css';
	import AlbumDetailLoading from '$lib/components/AlbumDetailLoading.svelte';
	import AlbumLibraryLoading from '$lib/components/AlbumLibraryLoading.svelte';
	import CatalogPageLoading from '$lib/components/CatalogPageLoading.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import ToastHost from '$lib/components/ToastHost.svelte';
	import VinylDisc from '$lib/components/VinylDisc.svelte';
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

<svelte:head>
	<style>
		body::before {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: -1;
			background:
				radial-gradient(
					ellipse 100% 60% at 50% -10%,
					rgba(255, 253, 246, 0.95),
					rgba(250, 246, 237, 0.6) 40%,
					transparent 75%
				),
				radial-gradient(
					ellipse 120% 50% at 50% 110%,
					rgba(214, 200, 174, 0.4),
					rgba(244, 238, 226, 0.2) 45%,
					transparent 70%
				),
				radial-gradient(circle at -20% 50%, rgba(252, 185, 0, 0.08), transparent 50%),
				radial-gradient(circle at 120% 50%, rgba(252, 185, 0, 0.08), transparent 50%), #f4eee2;
			transition: background 0.3s ease;
		}

		body::after {
			content: '';
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			height: 45vh;
			z-index: -1;
			background: linear-gradient(
				to top,
				rgba(93, 78, 58, 0.15) 0%,
				rgba(121, 104, 79, 0.08) 25%,
				transparent 100%
			);
			pointer-events: none;
			transition: background 0.3s ease;
		}

		[data-theme='dark'] body::before {
			background:
				radial-gradient(
					ellipse 90% 65% at 50% -15%,
					rgba(68, 60, 50, 0.8),
					rgba(48, 45, 42, 0.5) 35%,
					transparent 70%
				),
				radial-gradient(
					ellipse 110% 45% at 50% 115%,
					rgba(120, 100, 60, 0.25),
					rgba(80, 70, 40, 0.15) 50%,
					transparent 75%
				),
				radial-gradient(
					circle at -15% 35%,
					rgba(252, 185, 0, 0.12),
					rgba(252, 185, 0, 0.05) 35%,
					transparent 55%
				),
				radial-gradient(
					circle at 115% 65%,
					rgba(252, 185, 0, 0.12),
					rgba(252, 185, 0, 0.05) 35%,
					transparent 55%
				),
				radial-gradient(
					ellipse 70% 85% at 50% 50%,
					rgba(38, 35, 32, 1),
					rgba(28, 25, 23, 0.95) 60%,
					transparent 85%
				),
				#1c1917;
		}

		[data-theme='dark'] body::after {
			background: linear-gradient(
				to top,
				rgba(15, 13, 11, 0.8) 0%,
				rgba(20, 18, 16, 0.5) 30%,
				transparent 100%
			);
		}
	</style>
</svelte:head>

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

<footer
	class="mt-8 rounded-t-[2rem] border-t border-amber-400/80 bg-[rgb(var(--color-surface))] py-8 text-center text-sm font-bold text-[rgb(var(--color-text-secondary))] dark:border-amber-500/60"
>
	<div class="flex items-center justify-center gap-3">
		<VinylDisc spinning class="size-6 opacity-80" />
		<p class="tracking-wide uppercase">Media Club — Free, self-hosted media inventory</p>
		<VinylDisc spinning class="size-6 opacity-80" />
	</div>
</footer>
