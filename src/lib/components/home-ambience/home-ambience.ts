/**
 * Randomisation for the home page ambience: pools of coloured light on the page
 * edges (as if a screen were playing just out of view) and catalog covers that
 * drift through that light and fade away.
 *
 * Everything here takes an injectable random source so it can be tested.
 */

export type Rand = () => number;

export const SIDES = ['left', 'right'] as const;
export type AmbienceSide = (typeof SIDES)[number];

/** Each name maps to a `--color-glow-*` token generated from `src/lib/theme/palette.ts`. */
export const GLOW_COLORS = ['orange', 'red', 'blue', 'green'] as const;
export type GlowColor = (typeof GLOW_COLORS)[number];

/** Warm tones come up more often than cool ones. */
const GLOW_WEIGHTS: Record<GlowColor, number> = { orange: 3, red: 3, blue: 2, green: 2 };

export const GLOW_LAMPS_PER_SIDE = 2;

/** Below this width the side lanes overlap the page content, so fewer covers float at once. */
const NARROW_VIEWPORT_PX = 640;

export function maxFloatingCovers(viewportWidth: number): number {
	return viewportWidth < NARROW_VIEWPORT_PX ? 4 : 6;
}

function between(rand: Rand, min: number, max: number): number {
	return min + (max - min) * rand();
}

/** Weighted pick. Pass `avoid` so a lamp changes colour from one cycle to the next. */
export function pickGlowColor(rand: Rand = Math.random, avoid?: GlowColor): GlowColor {
	const candidates = GLOW_COLORS.filter((color) => color !== avoid);
	const total = candidates.reduce((sum, color) => sum + GLOW_WEIGHTS[color], 0);

	let roll = rand() * total;
	for (const color of candidates) {
		roll -= GLOW_WEIGHTS[color];
		if (roll < 0) return color;
	}
	return candidates[candidates.length - 1];
}

/** One slow fade in, shimmer, and fade out of a single pool of light. */
export interface GlowCycle {
	color: GlowColor;
	/** Vertical centre of the pool, as a percentage of the viewport height. */
	centerPct: number;
	/** Height of the pool, in viewport-height units. */
	heightVh: number;
	/** How far the light reaches into the page, as a percentage of the glow column. */
	reachPct: number;
	/** Opacity steps, evenly spaced over the cycle. Always starts and ends dark. */
	levels: number[];
	/** Vertical drift over the cycle, as a percentage of the pool height. */
	driftPct: number;
	durationMs: number;
	/** Dark gap before the lamp lights up again. */
	pauseMs: number;
}

export function createGlowCycle(rand: Rand = Math.random, previous?: GlowColor): GlowCycle {
	const peak = between(rand, 0.6, 1);
	// A single slow breath of light; no flicker between peaks.
	return {
		color: pickGlowColor(rand, previous),
		centerPct: between(rand, 8, 92),
		heightVh: between(rand, 55, 115),
		reachPct: between(rand, 60, 100),
		levels: [0, peak * 0.7, peak, peak * 0.7, 0],
		driftPct: between(rand, -12, 12),
		durationMs: between(rand, 24_000, 40_000),
		pauseMs: between(rand, 1_500, 7_000)
	};
}

/** Fixed, evenly spread glow used when motion is reduced (nothing fades or drifts). */
export function createStillGlow(index: number, side: AmbienceSide) {
	const offset = side === 'left' ? 0 : 2;
	return {
		color: GLOW_COLORS[(index + offset) % GLOW_COLORS.length],
		centerPct: 25 + index * 50,
		heightVh: 80,
		reachPct: 80,
		level: 0.5
	};
}

/** A cover tile drifting through one of the side lanes. */
export interface FloatingCover {
	key: number;
	src: string;
	side: AmbienceSide;
	/** Position across the lane: 0 hugs the page edge, 1 is the inner edge. */
	x: number;
	/** Starting top edge, as a percentage of the viewport height. */
	yPct: number;
	/** Tile width as a fraction of the lane width. */
	scale: number;
	tiltFromDeg: number;
	tiltToDeg: number;
	driftXRem: number;
	/** Negative values float upward. */
	driftYVh: number;
	peakOpacity: number;
	lifeMs: number;
	/** Clock reading (ms) at which the tile has fully faded and can be removed. */
	expiresAt: number;
}

/** Random cover that is not already on screen, or null when every cover is in use. */
export function pickCoverSrc(
	pool: readonly string[],
	onScreen: readonly string[],
	rand: Rand = Math.random
): string | null {
	const shown = new Set(onScreen);
	const available = pool.filter((src) => !shown.has(src));
	if (available.length === 0) return null;
	return available[Math.floor(rand() * available.length) % available.length];
}

/** Keeps the two lanes balanced: the emptier side wins, ties are a coin flip. */
export function pickSide(active: readonly FloatingCover[], rand: Rand = Math.random): AmbienceSide {
	const left = active.filter((tile) => tile.side === 'left').length;
	const right = active.length - left;
	if (left !== right) return left < right ? 'left' : 'right';
	return rand() < 0.5 ? 'left' : 'right';
}

const TILE_Y_MIN = 10;
const TILE_Y_MAX = 78;
const TILE_Y_CANDIDATES = 6;

/** Tries a few heights and keeps the one furthest from tiles already in the lane. */
export function pickTileY(taken: readonly number[], rand: Rand = Math.random): number {
	let best = between(rand, TILE_Y_MIN, TILE_Y_MAX);
	if (taken.length === 0) return best;

	const clearance = (y: number) => Math.min(...taken.map((other) => Math.abs(other - y)));
	let bestClearance = clearance(best);

	for (let i = 1; i < TILE_Y_CANDIDATES; i++) {
		const candidate = between(rand, TILE_Y_MIN, TILE_Y_MAX);
		const candidateClearance = clearance(candidate);
		if (candidateClearance > bestClearance) {
			best = candidate;
			bestClearance = candidateClearance;
		}
	}
	return best;
}

/** Slack after the fade-out finishes before a tile is dropped. */
const EXPIRY_GRACE_MS = 300;

export function createFloatingCover(
	key: number,
	src: string,
	active: readonly FloatingCover[],
	now: number,
	rand: Rand = Math.random
): FloatingCover {
	const side = pickSide(active, rand);
	const takenY = active.filter((tile) => tile.side === side).map((tile) => tile.yPct);
	const tilt = between(rand, -7, 7);
	const lifeMs = between(rand, 10_000, 17_000);

	return {
		key,
		src,
		side,
		// Squaring biases tiles toward the page edge, away from the centred content.
		x: rand() ** 2,
		yPct: pickTileY(takenY, rand),
		scale: between(rand, 0.38, 0.62),
		tiltFromDeg: tilt,
		tiltToDeg: tilt + between(rand, -5, 5),
		driftXRem: between(rand, -1.5, 1.5),
		driftYVh: -between(rand, 7, 18),
		peakOpacity: between(rand, 0.6, 0.9),
		lifeMs,
		expiresAt: now + lifeMs + EXPIRY_GRACE_MS
	};
}

/**
 * Tiles still within their lifetime. Expiry runs off the clock rather than
 * `animationend`, which browsers hold back while a page is not being painted.
 * Returns the same array when nothing has expired.
 */
export function dropExpired(tiles: FloatingCover[], now: number): FloatingCover[] {
	const live = tiles.filter((tile) => tile.expiresAt > now);
	return live.length === tiles.length ? tiles : live;
}

/** Gap between spawn attempts. */
export function nextSpawnDelayMs(rand: Rand = Math.random): number {
	return between(rand, 1_600, 3_800);
}

/** Retry gap when no cover is loaded yet (or every cover is already on screen). */
export const SPAWN_RETRY_MS = 800;

const PRELOAD_TIMEOUT_MS = 20_000;

/** Resolves true once the image can paint; false for a dead or very slow URL. */
export function preloadImage(src: string): Promise<boolean> {
	return new Promise((resolve) => {
		const img = new Image();
		const finish = (ok: boolean) => {
			clearTimeout(timeout);
			img.onload = null;
			img.onerror = null;
			resolve(ok);
		};
		const timeout = setTimeout(() => finish(false), PRELOAD_TIMEOUT_MS);
		img.onload = () => finish(img.naturalWidth > 0);
		img.onerror = () => finish(false);
		img.src = src;
	});
}

/** How many loaded, off-screen covers to keep waiting in the wings. */
const READY_TARGET = 3;

/**
 * Loads covers in the background, a few ahead of what is on screen, and hands out
 * only the ones that finished loading. A slow image host therefore never stalls
 * the flow of tiles, a tile never fades in empty, and a dead cover URL is never shown.
 */
export function createCoverQueue(load: (src: string) => Promise<boolean> = preloadImage) {
	const attempted = new Set<string>();
	const ready: string[] = [];
	let pending = 0;

	function topUp(pool: readonly string[], onScreen: readonly string[], rand: Rand) {
		const spare = ready.filter((src) => pool.includes(src) && !onScreen.includes(src)).length;

		while (spare + pending < READY_TARGET) {
			const src = pickCoverSrc(pool, [...attempted], rand);
			if (!src) return;

			attempted.add(src);
			pending += 1;
			void load(src).then((ok) => {
				pending -= 1;
				if (ok) ready.push(src);
			});
		}
	}

	return {
		/**
		 * A loaded cover from `pool` that is not on screen, or null when none is ready.
		 * Each call also starts loading replacements.
		 */
		take(
			pool: readonly string[],
			onScreen: readonly string[],
			rand: Rand = Math.random
		): string | null {
			const src = pickCoverSrc(
				ready.filter((loaded) => pool.includes(loaded)),
				onScreen,
				rand
			);
			topUp(pool, src ? [...onScreen, src] : onScreen, rand);
			return src;
		}
	};
}
