<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { settings } from '$lib/stores/settings.svelte';
	import FloatingCovers from './home-ambience/FloatingCovers.svelte';
	import ScreenGlow from './home-ambience/ScreenGlow.svelte';

	interface Props {
		/** Cover URLs sampled at random from the whole catalog. */
		covers: string[];
	}

	let { covers }: Props = $props();

	const animated = $derived(settings.motion !== 'reduced' && !prefersReducedMotion.current);
</script>

<!-- Decorative backdrop: coloured light on the page edges with covers drifting through it. -->
<div class="ambience" aria-hidden="true">
	<ScreenGlow {animated} />
	<FloatingCovers {covers} {animated} />
</div>

<style>
	/* Sits below the stacking scale in layout.css: above the body background,
	   behind all page content and the footer. */
	.ambience {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		pointer-events: none;
		contain: layout paint style;
	}
</style>
