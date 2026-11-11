<script lang="ts">
	import { browser } from '$app/environment';
	import { settings } from '$lib/stores/settings.svelte';
	import { cn } from '$lib/utils/cn';
	import { captureGifPoster } from '$lib/utils/gif-poster';
	import { isGifUrl } from '$lib/utils/is-gif-url';

	interface Props {
		src: string;
		alt: string;
		class?: string;
		hovered?: boolean;
		loading?: 'lazy' | 'eager';
	}

	let { src, alt, class: className = '', hovered: hoveredProp, loading = 'lazy' }: Props = $props();

	const isGif = $derived(isGifUrl(src));
	const reducedMotion = $derived(settings.motion === 'reduced');

	let internalHovered = $state(false);
	let posterUrl = $state<string | null>(null);
	let animKey = $state(0);
	/** The `src` that failed to load; compared against the current one so a new URL gets a fresh try. */
	let failedSrc = $state<string | null>(null);

	const failed = $derived(failedSrc === src);

	const isHovered = $derived(hoveredProp !== undefined ? hoveredProp : internalHovered);
	const showAnimated = $derived(isGif && isHovered && !reducedMotion);

	const displaySrc = $derived.by(() => {
		if (!isGif || showAnimated) {
			if (showAnimated) {
				const sep = src.includes('?') ? '&' : '?';
				return `${src}${sep}_gif=${animKey}`;
			}
			return src;
		}
		return posterUrl ?? src;
	});

	$effect(() => {
		if (!browser || !isGif || reducedMotion) {
			posterUrl = null;
			return;
		}

		let cancelled = false;
		posterUrl = null;
		void captureGifPoster(src).then((poster) => {
			if (!cancelled) posterUrl = poster;
		});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (hoveredProp === true && isGif && !reducedMotion) {
			animKey = Date.now();
		}
	});

	/**
	 * Flags the cover as failed when it cannot load. Uses a listener rather than an
	 * `onerror` attribute: Svelte server-renders that attribute as an inline handler,
	 * which the app's CSP (`script-src 'self'`) blocks and reports on every image.
	 */
	function watchLoadFailure(node: HTMLImageElement) {
		const markFailed = () => (failedSrc = src);
		node.addEventListener('error', markFailed);

		// An image that broke before hydration never fires `error` on the client, so re-test it.
		let probe: HTMLImageElement | undefined;
		if (node.complete && node.naturalWidth === 0) {
			probe = new Image();
			probe.onerror = markFailed;
			probe.src = node.currentSrc || node.src;
		}

		return () => {
			node.removeEventListener('error', markFailed);
			if (probe) probe.onerror = null;
		};
	}

	function handleMouseEnter() {
		if (hoveredProp !== undefined) return;
		internalHovered = true;
		if (isGif && !reducedMotion) animKey = Date.now();
	}

	function handleMouseLeave() {
		if (hoveredProp !== undefined) return;
		internalHovered = false;
	}
</script>

{#if failed}
	<!-- Dead cover URL: show the same placeholder as items without a cover instead of
	     the browser's broken-image icon. -->
	<div
		role="img"
		aria-label={alt}
		class={cn(
			'flex items-center justify-center bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400',
			className
		)}
	>
		<span class="px-1 text-center text-[10px] leading-tight font-bold uppercase">No cover</span>
	</div>
{:else}
	<img
		src={displaySrc}
		{alt}
		class={cn(className)}
		{loading}
		{@attach watchLoadFailure}
		onmouseenter={hoveredProp === undefined ? handleMouseEnter : undefined}
		onmouseleave={hoveredProp === undefined ? handleMouseLeave : undefined}
	/>
{/if}
