import { describe, expect, it } from 'vitest';
import { formatApiErrorMessage } from './api-error';

describe('formatApiErrorMessage', () => {
	it('extracts message from JSON error bodies', () => {
		expect(formatApiErrorMessage('{"message":"TMDB_API_KEY is not configured"}')).toBe(
			'TMDB_API_KEY is not configured'
		);
	});

	it('returns plain text as-is', () => {
		expect(formatApiErrorMessage('Something went wrong')).toBe('Something went wrong');
	});

	it('returns fallback for empty input', () => {
		expect(formatApiErrorMessage('', 'Search failed')).toBe('Search failed');
	});
});
