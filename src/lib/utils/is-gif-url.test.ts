import { describe, expect, it } from 'vitest';
import { isGifUrl } from './is-gif-url';

describe('isGifUrl', () => {
	it('detects .gif extension case-insensitively', () => {
		expect(isGifUrl('https://example.com/cover.gif')).toBe(true);
		expect(isGifUrl('https://example.com/cover.GIF')).toBe(true);
		expect(isGifUrl('https://example.com/cover.Gif')).toBe(true);
	});

	it('ignores query strings and hashes', () => {
		expect(isGifUrl('https://example.com/cover.gif?v=1')).toBe(true);
		expect(isGifUrl('https://example.com/cover.gif#frame')).toBe(true);
	});

	it('rejects non-gif extensions', () => {
		expect(isGifUrl('https://example.com/cover.jpg')).toBe(false);
		expect(isGifUrl('https://example.com/cover.png')).toBe(false);
		expect(isGifUrl('https://example.com/gif-cover.webp')).toBe(false);
	});

	it('handles relative paths', () => {
		expect(isGifUrl('/uploads/poster.gif')).toBe(true);
		expect(isGifUrl('/uploads/poster.jpg')).toBe(false);
	});

	it('returns false for empty input', () => {
		expect(isGifUrl('')).toBe(false);
	});
});
