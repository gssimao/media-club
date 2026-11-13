<script lang="ts">
	import CoverImage from '$lib/components/CoverImage.svelte';
	import {
		createCoverQueue,
		createFloatingCover,
		dropExpired,
		maxFloatingCovers,
		nextSpawnDelayMs,
		SIDES,
		SPAWN_RETRY_MS,
		type FloatingCover
	} from './home-ambience';

	interface Props {
		/** Cover URLs to draw from at random. */
		covers: string[];
		/** False when motion is reduced: no tiles are spawned. */
		animated: boolean;
	}

	let { covers, animated }: Props = $props();

	let floating = $state.raw<FloatingCover[]>([]);
	const hasCovers = $derived(covers.length > 0);
	const bySide = $derived({
		left: floating.filter((tile) => tile.side === 'left'),
		right: floating.filter((tile) => tile.side === 'right')
	});

	const queue = createCoverQueue();
	let nextKey = 0;

	$effect(() => {
		if (!animated || !hasCovers) return;

		let timer: ReturnType<typeof setTimeout> | undefined;

		/** One tick: clear tiles that have faded out, then float a new one if there is room. */
		function tick() {
			const now = performance.now();
			let delay = nextSpawnDelayMs();
			let next = dropExpired(floating, now);

			// Nobody is watching a hidden tab, so no new covers are loaded or floated.
			if (!document.hidden && next.length < maxFloatingCovers(window.innerWidth)) {
				const src = queue.take(
					covers,
					next.map((tile) => tile.src)
				);
				if (src) {
					next = [...next, createFloatingCover(nextKey++, src, next, now)];
				} else {
					delay = SPAWN_RETRY_MS;
				}
			}

			floating = next;
			timer = setTimeout(tick, delay);
		}

		// The first call only starts loading covers; a tile follows on the next try.
		timer = setTimeout(tick, 100);

		return () => {
			clearTimeout(timer);
			floating = [];
		};
	});
</script>

{#each SIDES as side (side)}
	<div class="lane lane--{side}">
		{#each bySide[side] as tile (tile.key)}
			<div
				class="tile"
				style:--x={tile.x.toFixed(3)}
				style:--y="{tile.yPct.toFixed(1)}%"
				style:--scale={tile.scale.toFixed(3)}
				style:--tilt-from="{tile.tiltFromDeg.toFixed(1)}deg"
				style:--tilt-to="{tile.tiltToDeg.toFixed(1)}deg"
				style:--dx="{tile.driftXRem.toFixed(2)}rem"
				style:--dy="{tile.driftYVh.toFixed(1)}vh"
				style:--peak={tile.peakOpacity.toFixed(2)}
				style:--life="{Math.round(tile.lifeMs)}ms"
			>
				<div class="tile-art">
					<CoverImage src={tile.src} alt="" class="size-full object-cover" loading="eager" />
				</div>
			</div>
		{/each}
	</div>
{/each}

<style>
	.lane {
		--lane-inset: 0rem;

		position: absolute;
		top: 0;
		bottom: 0;
		width: clamp(5.5rem, 14vw, 17rem);
	}

	.lane--left {
		left: var(--lane-inset);
	}

	.lane--right {
		right: var(--lane-inset);
	}

	/* Phones have no side gutters: push tiles half off the edge and dim them so they
	   stay a backdrop behind the title and disc. */
	@media (max-width: 639px) {
		.lane {
			--lane-inset: -1rem;
			opacity: 0.65;
		}
	}

	/* Position and size are fractions of the lane, so tiles scale with the viewport. */
	.tile {
		--offset: calc(var(--x) * (1 - var(--scale)) * 100%);

		position: absolute;
		top: var(--y);
		width: calc(var(--scale) * 100%);
		aspect-ratio: 1;
		opacity: 0;
		will-change: opacity, transform;
		animation: cover-drift var(--life) ease-in-out forwards;
	}

	.lane--left .tile {
		left: var(--offset);
	}

	.lane--right .tile {
		right: var(--offset);
	}

	/* Rounded square: the corner radius follows the tile size (design-theme.mdc). */
	.tile-art {
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 22%;
		box-shadow:
			0 0.75rem 2rem rgb(0 0 0 / 0.35),
			0 0 0 1px rgb(255 255 255 / 0.08);
		animation: cover-bob 9s ease-in-out infinite alternate;
	}

	@keyframes cover-drift {
		0% {
			opacity: 0;
			transform: translate3d(0, 0, 0) rotate(var(--tilt-from)) scale(0.84);
		}
		16% {
			opacity: var(--peak);
		}
		66% {
			opacity: var(--peak);
		}
		100% {
			opacity: 0;
			transform: translate3d(var(--dx), var(--dy), 0) rotate(var(--tilt-to)) scale(1.04);
		}
	}

	@keyframes cover-bob {
		from {
			transform: translateY(-0.2rem);
		}
		to {
			transform: translateY(0.2rem);
		}
	}
</style>
