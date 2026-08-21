import { describe, expect, it } from 'vitest';
import {
	isEnhancedFormRequest,
	finishAdminMutation,
	sanitizeAlbumAccentColor,
	sanitizeHttpUrl
} from './admin';

describe('isEnhancedFormRequest', () => {
	it('returns true for SvelteKit enhanced form submissions', () => {
		const request = new Request('http://localhost/admin/items?/updateTags', {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true' }
		});
		expect(isEnhancedFormRequest(request)).toBe(true);
	});

	it('returns false for plain form posts', () => {
		const request = new Request('http://localhost/admin/items?/updateTags', {
			method: 'POST'
		});
		expect(isEnhancedFormRequest(request)).toBe(false);
	});
});

describe('finishAdminMutation', () => {
	it('does not redirect enhanced form submissions', () => {
		const request = new Request('http://localhost/admin/items?/add', {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true', referer: 'http://localhost/movies' }
		});

		expect(() => finishAdminMutation(request)).not.toThrow();
	});
});

describe('sanitizeHttpUrl', () => {
	it('accepts https URLs', () => {
		expect(sanitizeHttpUrl('https://image.tmdb.org/t/p/w342/poster.jpg')).toBe(
			'https://image.tmdb.org/t/p/w342/poster.jpg'
		);
	});

	it('accepts http URLs', () => {
		expect(sanitizeHttpUrl('http://covers.example.com/a.jpg')).toBe(
			'http://covers.example.com/a.jpg'
		);
	});

	it('rejects javascript: URLs', () => {
		expect(sanitizeHttpUrl('javascript:alert(1)')).toBeNull();
	});

	it('rejects data: URLs', () => {
		expect(sanitizeHttpUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
	});

	it('rejects relative paths and garbage', () => {
		expect(sanitizeHttpUrl('/local/path.jpg')).toBeNull();
		expect(sanitizeHttpUrl('not a url')).toBeNull();
	});

	it('returns null for empty values', () => {
		expect(sanitizeHttpUrl(null)).toBeNull();
		expect(sanitizeHttpUrl('')).toBeNull();
		expect(sanitizeHttpUrl('   ')).toBeNull();
	});
});

describe('sanitizeAlbumAccentColor', () => {
	it('accepts whitelisted accent colors', () => {
		expect(sanitizeAlbumAccentColor('rose')).toBe('rose');
		expect(sanitizeAlbumAccentColor('amber')).toBe('amber');
	});

	it('rejects unknown values', () => {
		expect(sanitizeAlbumAccentColor('red')).toBeNull();
		expect(sanitizeAlbumAccentColor('javascript:alert(1)')).toBeNull();
	});

	it('returns null for empty values', () => {
		expect(sanitizeAlbumAccentColor(null)).toBeNull();
		expect(sanitizeAlbumAccentColor('')).toBeNull();
		expect(sanitizeAlbumAccentColor('   ')).toBeNull();
	});
});
