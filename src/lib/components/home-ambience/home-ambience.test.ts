import { describe, expect, it } from 'vitest';
import {
	createCoverQueue,
	createFloatingCover,
	createGlowCycle,
	dropExpired,
	GLOW_COLORS,
	maxFloatingCovers,
	pickCoverSrc,
	pickGlowColor,
	pickSide,
	pickTileY,
	type FloatingCover,
	type Rand
} from './home-ambience';

/** Deterministic random source that replays the given values in a loop. */
function sequence(...values: number[]): Rand {
	let i = 0;
	return () => values[i++ % values.length];
}

/** Small seeded generator for range checks over many samples. */
function seeded(seed: number): Rand {
	let state = seed;
	return () => {
		state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
		return state / 4_294_967_296;
	};
}

function tile(overrides: Partial<FloatingCover>): FloatingCover {
	return { ...createFloatingCover(0, 'cover.jpg', [], 0, sequence(0.5)), ...overrides };
}

describe('pickGlowColor', () => {
	it('covers every colour across the random range', () => {
		const rand = seeded(7);
		const seen = new Set(Array.from({ length: 200 }, () => pickGlowColor(rand)));
		expect([...seen].sort()).toEqual([...GLOW_COLORS].sort());
	});

	it('favours warm colours over cool ones', () => {
		const rand = seeded(11);
		const picks = Array.from({ length: 2_000 }, () => pickGlowColor(rand));
		const warm = picks.filter((color) => color === 'orange' || color === 'red').length;
		expect(warm).toBeGreaterThan(picks.length / 2);
	});

	it('never repeats the colour it is told to avoid', () => {
		const rand = seeded(3);
		for (const avoid of GLOW_COLORS) {
			const picks = Array.from({ length: 100 }, () => pickGlowColor(rand, avoid));
			expect(picks).not.toContain(avoid);
		}
	});

	it('stays in range when the random source returns its extremes', () => {
		expect(GLOW_COLORS).toContain(pickGlowColor(() => 0));
		expect(GLOW_COLORS).toContain(pickGlowColor(() => 0.999999));
	});
});

describe('createGlowCycle', () => {
	it('starts and ends dark, and is lit in between', () => {
		const rand = seeded(21);
		for (let i = 0; i < 50; i++) {
			const { levels } = createGlowCycle(rand);
			expect(levels[0]).toBe(0);
			expect(levels[levels.length - 1]).toBe(0);
			for (const level of levels.slice(1, -1)) {
				expect(level).toBeGreaterThan(0);
				expect(level).toBeLessThanOrEqual(1);
			}
		}
	});

	it('is slow: every cycle lasts at least ten seconds', () => {
		const rand = seeded(5);
		for (let i = 0; i < 50; i++) {
			expect(createGlowCycle(rand).durationMs).toBeGreaterThanOrEqual(10_000);
		}
	});
});

describe('pickCoverSrc', () => {
	it('returns null for an empty pool', () => {
		expect(pickCoverSrc([], [])).toBeNull();
	});

	it('skips covers that are already on screen', () => {
		const rand = seeded(9);
		for (let i = 0; i < 50; i++) {
			expect(pickCoverSrc(['a', 'b', 'c'], ['a', 'c'], rand)).toBe('b');
		}
	});

	it('returns null when every cover is on screen', () => {
		expect(pickCoverSrc(['a', 'b'], ['b', 'a'])).toBeNull();
	});
});

describe('pickSide', () => {
	it('picks the emptier lane', () => {
		expect(pickSide([tile({ side: 'left' })])).toBe('right');
		expect(pickSide([tile({ side: 'right' }), tile({ side: 'right' })])).toBe('left');
	});

	it('flips a coin on a tie', () => {
		expect(pickSide([], () => 0.1)).toBe('left');
		expect(pickSide([], () => 0.9)).toBe('right');
	});
});

describe('pickTileY', () => {
	it('keeps the candidate furthest from tiles already in the lane', () => {
		// Candidates map 0..1 onto the 10%..78% band: 0 -> 10, 0.5 -> 44, 1 -> 78.
		const y = pickTileY([12], sequence(0, 0.5, 1, 0.25, 0.75, 0.1));
		expect(y).toBe(78);
	});
});

describe('maxFloatingCovers', () => {
	it('floats fewer covers on narrow viewports', () => {
		expect(maxFloatingCovers(390)).toBeLessThan(maxFloatingCovers(1440));
	});
});

describe('createFloatingCover', () => {
	it('floats upward, stays inside its lane, and stays translucent', () => {
		const rand = seeded(42);
		const active: FloatingCover[] = [];
		for (let key = 0; key < 100; key++) {
			const cover = createFloatingCover(key, `cover-${key}.jpg`, active.slice(-4), 1_000, rand);
			active.push(cover);

			expect(cover.driftYVh).toBeLessThan(0);
			expect(cover.x).toBeGreaterThanOrEqual(0);
			expect(cover.x).toBeLessThanOrEqual(1);
			expect(cover.scale).toBeGreaterThan(0);
			expect(cover.scale).toBeLessThan(1);
			expect(cover.peakOpacity).toBeLessThan(1);
			expect(cover.expiresAt).toBeGreaterThan(1_000 + cover.lifeMs);
		}
	});
});

describe('dropExpired', () => {
	it('removes tiles whose lifetime has passed and keeps the rest', () => {
		const tiles = [tile({ key: 1, expiresAt: 5_000 }), tile({ key: 2, expiresAt: 9_000 })];
		expect(dropExpired(tiles, 6_000).map((t) => t.key)).toEqual([2]);
	});

	it('returns the same array when nothing has expired', () => {
		const tiles = [tile({ expiresAt: 5_000 })];
		expect(dropExpired(tiles, 1_000)).toBe(tiles);
	});
});

describe('createCoverQueue', () => {
	/** Lets the queue's pending load promises settle. */
	const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

	it('hands out a cover only after it has loaded', async () => {
		const queue = createCoverQueue(async () => true);
		const pool = ['a', 'b'];

		expect(queue.take(pool, [])).toBeNull();
		await settle();
		expect(pool).toContain(queue.take(pool, []));
	});

	it('never hands out a cover that failed to load', async () => {
		const queue = createCoverQueue(async (src) => src !== 'dead');
		const pool = ['dead', 'alive'];

		queue.take(pool, []);
		await settle();
		for (let i = 0; i < 20; i++) {
			expect(queue.take(pool, [])).toBe('alive');
		}
	});

	it('skips covers that are already on screen', async () => {
		const queue = createCoverQueue(async () => true);
		const pool = ['a', 'b'];

		queue.take(pool, []);
		await settle();
		expect(queue.take(pool, ['a'])).toBe('b');
		expect(queue.take(pool, ['a', 'b'])).toBeNull();
	});

	it('loads only a few covers ahead and tries each URL once', async () => {
		const loaded: string[] = [];
		const queue = createCoverQueue(async (src) => {
			loaded.push(src);
			return true;
		});
		const pool = Array.from({ length: 20 }, (_, i) => `cover-${i}`);

		queue.take(pool, []);
		await settle();
		expect(loaded).toHaveLength(3);

		// Taking one cover for the screen loads exactly one replacement.
		const onScreen = [queue.take(pool, []) as string];
		await settle();
		expect(loaded).toHaveLength(4);

		for (let i = 0; i < 60; i++) {
			const src = queue.take(pool, onScreen);
			if (src) onScreen.push(src);
			await settle();
		}
		expect(new Set(loaded).size).toBe(loaded.length);
		expect([...onScreen].sort()).toEqual([...pool].sort());
	});

	it('drops loaded covers that have left the pool', async () => {
		const queue = createCoverQueue(async () => true);

		queue.take(['old'], []);
		await settle();
		expect(queue.take(['new'], [])).toBeNull();
		await settle();
		expect(queue.take(['new'], [])).toBe('new');
	});
});
