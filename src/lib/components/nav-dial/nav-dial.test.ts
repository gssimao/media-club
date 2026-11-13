import { describe, expect, it } from 'vitest';
import {
	angularDistance,
	buildNavItems,
	dialHasOpenedBefore,
	getSavedDialRotation,
	itemAnglesForCount,
	markDialOpened,
	nearestItemIndex,
	nearestSnapRotation,
	nearestItemIndexWithHysteresis,
	normalizeAngle,
	saveDialRotation,
	shouldRestoreDialRotation,
	snapRotationToIndex,
	unwrapAngleDelta
} from './nav-dial';

describe('normalizeAngle', () => {
	it('wraps angles into 0–360', () => {
		expect(normalizeAngle(450)).toBe(90);
		expect(normalizeAngle(-90)).toBe(270);
		expect(normalizeAngle(-720)).toBe(0);
	});
});

describe('angularDistance', () => {
	it('uses the shortest arc between two headings', () => {
		expect(angularDistance(350, 10)).toBe(20);
		expect(angularDistance(10, 350)).toBe(20);
	});
});

describe('unwrapAngleDelta', () => {
	it('picks the shortest step across the wrap point', () => {
		expect(unwrapAngleDelta(20)).toBe(20);
		expect(unwrapAngleDelta(340)).toBe(-20);
		expect(unwrapAngleDelta(-340)).toBe(20);
	});
});

describe('nearestItemIndex', () => {
	const angles = itemAnglesForCount(8);

	it('finds the item at the selector for canonical rotation', () => {
		expect(nearestItemIndex(angles, snapRotationToIndex(angles, 3))).toBe(3);
	});

	it('matches the same item after multiple full turns', () => {
		const base = snapRotationToIndex(angles, 2);
		expect(nearestItemIndex(angles, base)).toBe(2);
		expect(nearestItemIndex(angles, base - 720)).toBe(2);
		expect(nearestItemIndex(angles, base + 1080)).toBe(2);
	});

	it('tracks cumulative drag rotation beyond 360°', () => {
		let rotation = snapRotationToIndex(angles, 0);
		let last = 0;
		const pointer = [0, 90, 180, 270, 360, 450];
		for (const angle of pointer) {
			rotation -= unwrapAngleDelta(angle - last);
			last = angle;
		}
		expect(nearestItemIndex(angles, rotation)).toBe(2);
	});
});

describe('nearestItemIndexWithHysteresis', () => {
	const angles = itemAnglesForCount(8);

	it('keeps the sticky item until another is clearly closer', () => {
		const base = snapRotationToIndex(angles, 0);
		const nudged = base - 25;
		expect(nearestItemIndex(angles, nudged)).toBe(1);
		expect(nearestItemIndexWithHysteresis(angles, nudged, 0)).toBe(0);
	});

	it('switches when the candidate is far enough past the midpoint', () => {
		const rotation = snapRotationToIndex(angles, 1);
		expect(nearestItemIndexWithHysteresis(angles, rotation, 0)).toBe(1);
	});
});
describe('snapRotationToIndex', () => {
	const angles = itemAnglesForCount(8);

	it('returns a bounded rotation that still selects the item', () => {
		const rotation = snapRotationToIndex(angles, 7);
		expect(rotation).toBeGreaterThan(-180);
		expect(rotation).toBeLessThanOrEqual(180);
		expect(nearestItemIndex(angles, rotation)).toBe(7);
	});
});

describe('dial rotation persistence', () => {
	const instanceId = `test-${Date.now()}-${Math.random()}`;

	it('restores rotation only after the dial has opened once', () => {
		expect(dialHasOpenedBefore(instanceId)).toBe(false);
		expect(getSavedDialRotation(instanceId)).toBeNull();
		expect(shouldRestoreDialRotation(instanceId)).toBe(false);

		markDialOpened(instanceId);
		expect(dialHasOpenedBefore(instanceId)).toBe(true);
		expect(shouldRestoreDialRotation(instanceId)).toBe(false);

		saveDialRotation(instanceId, 135);
		expect(getSavedDialRotation(instanceId)).toBe(135);
		expect(shouldRestoreDialRotation(instanceId)).toBe(true);
	});
});

describe('buildNavItems', () => {
	const items = buildNavItems(null);
	const activeLabel = (path: string) => items.find((item) => item.match(path))?.label;

	it('matches each category page', () => {
		expect(activeLabel('/movies')).toBe('Movies');
		expect(activeLabel('/shows/watching')).toBe('Shows');
		expect(activeLabel('/music')).toBe('Music');
		expect(activeLabel('/books')).toBe('Books');
		expect(activeLabel('/wishlist/books')).toBe('Wishlist');
	});

	it('keeps the category selected on its collection pages', () => {
		expect(activeLabel('/albums/movie')).toBe('Movies');
		expect(activeLabel('/albums/movie/abc-123')).toBe('Movies');
		expect(activeLabel('/albums/show')).toBe('Shows');
		expect(activeLabel('/albums/music/abc-123')).toBe('Music');
		expect(activeLabel('/albums/book')).toBe('Books');
	});

	it('does not confuse categories that share a prefix', () => {
		expect(activeLabel('/albums/movies-extra')).toBeUndefined();
		expect(activeLabel('/')).toBe('Home');
	});

	it('swaps the last node between Log in and Admin', () => {
		expect(activeLabel('/login')).toBe('Log in');
		const adminItems = buildNavItems({ id: 'u1', username: 'admin' });
		expect(adminItems.find((item) => item.match('/admin/streaming'))?.label).toBe('Admin');
		expect(adminItems.some((item) => item.label === 'Log in')).toBe(false);
	});
});

describe('nearestSnapRotation', () => {
	const angles = itemAnglesForCount(8);
	it('does not unwind full revolutions when released after a long drag', () => {
		const rotation = nearestSnapRotation(angles, 2, 1000);
		expect(Math.abs(rotation - 1000)).toBeLessThanOrEqual(180);
		expect(nearestItemIndex(angles, rotation)).toBe(2);
	});
	it('crosses the negative/positive boundary by the short arc', () => {
		expect(nearestSnapRotation(angles, 4, -179)).toBe(-180);
		expect(nearestSnapRotation(angles, 4, 179)).toBe(180);
	});
});
