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

<img
	src={displaySrc}
	{alt}
	class={cn(className)}
	{loading}
	onmouseenter={hoveredProp === undefined ? handleMouseEnter : undefined}
	onmouseleave={hoveredProp === undefined ? handleMouseLeave : undefined}
/>
