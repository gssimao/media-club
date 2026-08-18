import type { AlbumAccentColor } from './album-colors';

const ACCENT_RGB: Record<AlbumAccentColor, string> = {
	amber: '180 83 9',
	rose: '225 29 72',
	sky: '2 132 199',
	emerald: '5 150 105',
	violet: '124 58 237',
	orange: '234 88 12',
	fuchsia: '192 38 211',
	stone: '120 113 108'
};

function hashString(value: string): number {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

/** Deterministic stripe layout from album id — stable across re-renders. */
export function getAlbumSleevePatternStyle(seed: string, accentColor: AlbumAccentColor): string {
	const hash = hashString(seed);
	const angle1 = 18 + (hash % 72);
	const angle2 = 102 + ((hash >> 5) % 58);
	const stripe1 = 4 + (hash % 7);
	const stripe2 = 3 + ((hash >> 8) % 6);
	const period1 = stripe1 + 7 + ((hash >> 12) % 10);
	const period2 = stripe2 + 9 + ((hash >> 16) % 12);
	const opacity1 = 0.14 + ((hash >> 20) % 11) / 100;
	const opacity2 = 0.08 + ((hash >> 24) % 9) / 100;

	return [
		`--sp-a1:${angle1}deg`,
		`--sp-a2:${angle2}deg`,
		`--sp-s1:${stripe1}px`,
		`--sp-s2:${stripe2}px`,
		`--sp-p1:${period1}px`,
		`--sp-p2:${period2}px`,
		`--sp-rgb:${ACCENT_RGB[accentColor]}`,
		`--sp-o1:${opacity1.toFixed(3)}`,
		`--sp-o2:${opacity2.toFixed(3)}`
	].join(';');
}
