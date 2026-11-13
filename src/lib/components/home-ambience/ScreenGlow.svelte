<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import {
		createGlowCycle,
		createStillGlow,
		GLOW_LAMPS_PER_SIDE,
		SIDES,
		type AmbienceSide,
		type GlowColor
	} from './home-ambience';

	interface Props {
		/** False when motion is reduced: lamps hold a dim, steady glow instead of cycling. */
		animated: boolean;
	}

	let { animated }: Props = $props();

	const lampIndexes = Array.from({ length: GLOW_LAMPS_PER_SIDE }, (_, i) => i);

	function place(
		node: HTMLElement,
		glow: { color: GlowColor; centerPct: number; heightVh: number; reachPct: number }
	) {
		node.style.setProperty('--glow-rgb', `var(--color-glow-${glow.color})`);
		node.style.setProperty('--glow-center', `${glow.centerPct.toFixed(1)}%`);
		node.style.setProperty('--glow-height', `${glow.heightVh.toFixed(1)}vh`);
		node.style.setProperty('--glow-reach', `${glow.reachPct.toFixed(1)}%`);
	}

	/** Runs one lamp: light up somewhere along the edge, shimmer, go dark, wait, repeat. */
	function lamp(index: number, side: AmbienceSide): Attachment<HTMLElement> {
		return (node) => {
			if (!animated) {
				const still = createStillGlow(index, side);
				place(node, still);
				node.style.opacity = String(still.level);
				return () => {
					node.style.opacity = '';
				};
			}

			let timer: ReturnType<typeof setTimeout> | undefined;
			let animation: Animation | undefined;
			let lastColor: GlowColor | undefined;

			function runCycle() {
				const cycle = createGlowCycle(Math.random, lastColor);
				lastColor = cycle.color;
				place(node, cycle);

				const lastStep = cycle.levels.length - 1;
				animation = node.animate(
					cycle.levels.map((opacity, step) => ({
						opacity,
						transform: `translateY(${((cycle.driftPct * step) / lastStep).toFixed(2)}%)`,
						easing: 'ease-in-out'
					})),
					{ duration: cycle.durationMs }
				);
				animation.onfinish = () => {
					timer = setTimeout(runCycle, cycle.pauseMs);
				};
			}

			// The first lamp on each side lights almost at once; the rest stagger in.
			timer = setTimeout(runCycle, index === 0 ? 200 : 1_500 + Math.random() * 6_000);

			return () => {
				clearTimeout(timer);
				animation?.cancel();
			};
		};
	}
</script>

{#each SIDES as side (side)}
	<div class="glow glow--{side}">
		{#each lampIndexes as index (index)}
			<div class="lamp" {@attach lamp(index, side)}></div>
		{/each}
	</div>
{/each}

<style>
	.glow {
		position: absolute;
		top: 0;
		bottom: 0;
		width: min(44vw, 38rem);
	}

	.glow--left {
		left: 0;
	}

	.glow--right {
		right: 0;
	}

	/* A soft half-ellipse of light anchored to the page edge. Gradient only (no blur
	   filter) and animated through opacity/transform, so it stays on the compositor. */
	.lamp {
		--glow-strength: 0.24;
		--glow-anchor: 0%;

		position: absolute;
		top: calc(var(--glow-center, 50%) - var(--glow-height, 80vh) / 2);
		width: var(--glow-reach, 80%);
		height: var(--glow-height, 80vh);
		opacity: 0;
		will-change: opacity, transform;
		background: radial-gradient(
			ellipse 100% 50% at var(--glow-anchor) 50%,
			rgb(var(--glow-rgb, var(--color-glow-orange)) / var(--glow-strength)) 0%,
			rgb(var(--glow-rgb, var(--color-glow-orange)) / calc(var(--glow-strength) * 0.62)) 22%,
			rgb(var(--glow-rgb, var(--color-glow-orange)) / calc(var(--glow-strength) * 0.3)) 46%,
			rgb(var(--glow-rgb, var(--color-glow-orange)) / calc(var(--glow-strength) * 0.1)) 66%,
			transparent 82%
		);
	}

	.glow--left .lamp {
		left: 0;
	}

	.glow--right .lamp {
		--glow-anchor: 100%;
		right: 0;
	}

	:global([data-theme='dark']) .lamp {
		--glow-strength: 0.42;
	}
</style>
