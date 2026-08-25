import { describe, expect, it } from 'vitest';
import {
	addGenre,
	collectUniqueGenres,
	dedupeGenres,
	getDisplayGenres,
	itemMatchesGenreFilter,
	mapGenreIdsToNames,
	mergeTmdbGenres,
	normalizeGenreName,
	parseGenresFromMetadata,
	removeGenre
} from './movie-genres';

describe('parseGenresFromMetadata', () => {
	it('returns null when genres field is absent', () => {
		expect(parseGenresFromMetadata({ tmdbId: 1 })).toBeNull();
		expect(parseGenresFromMetadata(null)).toBeNull();
	});

	it('returns string genres from metadata', () => {
		expect(parseGenresFromMetadata({ genres: ['Action', 'Sci-Fi'] })).toEqual(['Action', 'Sci-Fi']);
	});
});

describe('dedupeGenres', () => {
	it('dedupes case-insensitively and trims', () => {
		expect(dedupeGenres([' Action ', 'action', 'Drama'])).toEqual(['Action', 'Drama']);
	});
});

describe('addGenre and removeGenre', () => {
	it('adds and removes genres', () => {
		expect(addGenre(['Action'], 'Drama')).toEqual(['Action', 'Drama']);
		expect(removeGenre(['Action', 'Drama'], 'action')).toEqual(['Drama']);
	});
});

describe('getDisplayGenres', () => {
	it('returns empty array when metadata has no genres', () => {
		expect(getDisplayGenres({ metadata: { tmdbId: 1 } })).toEqual([]);
	});
});

describe('itemMatchesGenreFilter', () => {
	it('matches when any selected genre is present', () => {
		expect(itemMatchesGenreFilter(['Action', 'Drama'], ['drama'])).toBe(true);
		expect(itemMatchesGenreFilter(['Action'], ['Horror'])).toBe(false);
		expect(itemMatchesGenreFilter(['Action'], [])).toBe(true);
	});
});

describe('collectUniqueGenres', () => {
	it('collects sorted unique genres across items', () => {
		expect(
			collectUniqueGenres([
				{ metadata: { genres: ['Drama', 'Action'] } },
				{ metadata: { genres: ['action', 'Comedy'] } },
				{ metadata: null }
			])
		).toEqual(['Action', 'Comedy', 'Drama']);
	});
});

describe('mapGenreIdsToNames', () => {
	it('maps TMDB genre ids to names', () => {
		const map = { 28: 'Action', 878: 'Science Fiction' };
		expect(mapGenreIdsToNames([28, 878, 999], map)).toEqual(['Action', 'Science Fiction']);
	});
});

describe('mergeTmdbGenres', () => {
	it('merges TMDB genres while preserving custom tags in keep mode', () => {
		expect(mergeTmdbGenres(['Custom Tag', 'Action'], ['Drama', 'action'], 'keep')).toEqual([
			'Custom Tag',
			'Action',
			'Drama'
		]);
	});

	it('replaces all genres in overwrite mode', () => {
		expect(mergeTmdbGenres(['Custom Tag', 'Action'], ['Drama', 'Sci-Fi'], 'overwrite')).toEqual([
			'Drama',
			'Sci-Fi'
		]);
	});
});

describe('normalizeGenreName', () => {
	it('rejects empty strings', () => {
		expect(normalizeGenreName('   ')).toBeNull();
	});
});
