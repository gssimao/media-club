<script lang="ts">
	import { getAlbumSleevePatternStyle } from '$lib/theme/album-sleeve-pattern';
	import type { AlbumAccentColor } from '$lib/theme/album-colors';

	interface Props {
		seed: string;
		accentColor?: AlbumAccentColor | null;
	}

	let { seed, accentColor = 'amber' }: Props = $props();

	const patternStyle = $derived(getAlbumSleevePatternStyle(seed, accentColor ?? 'amber'));
</script>

<div class="sleeve-strip-pattern" style={patternStyle} aria-hidden="true"></div>

<style>
	.sleeve-strip-pattern {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image:
			repeating-linear-gradient(
				var(--sp-a1),
				transparent 0,
				transparent var(--sp-s1),
				rgb(var(--sp-rgb) / var(--sp-o1)) var(--sp-s1),
				rgb(var(--sp-rgb) / var(--sp-o1)) var(--sp-p1)
			),
			repeating-linear-gradient(
				var(--sp-a2),
				transparent 0,
				transparent var(--sp-s2),
				rgb(255 255 255 / var(--sp-o2)) var(--sp-s2),
				rgb(255 255 255 / var(--sp-o2)) var(--sp-p2)
			);
	}

	:global([data-theme='dark']) .sleeve-strip-pattern {
		background-image:
			repeating-linear-gradient(
				var(--sp-a1),
				transparent 0,
				transparent var(--sp-s1),
				rgb(var(--sp-rgb) / calc(var(--sp-o1) + 0.06)) var(--sp-s1),
				rgb(var(--sp-rgb) / calc(var(--sp-o1) + 0.06)) var(--sp-p1)
			),
			repeating-linear-gradient(
				var(--sp-a2),
				transparent 0,
				transparent var(--sp-s2),
				rgb(0 0 0 / var(--sp-o2)) var(--sp-s2),
				rgb(0 0 0 / var(--sp-o2)) var(--sp-p2)
			);
	}
</style>
