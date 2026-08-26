import { describe, expect, it } from 'vitest';
import {
	addGenre,
	buildGenreCatalog,
	collectUniqueGenres,
	dedupeGenres,
	getDisplayGenres,
	isTmdbGenreName,
	itemMatchesGenreFilter,
	mapGenreIdsToNames,
	mergeTmdbGenres,
	normalizeGenreName,
	parseGenresFromMetadata,
	removeGenre,
	toggleGenreSelection
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

	it('matches when all selected genres are present in all mode', () => {
		expect(itemMatchesGenreFilter(['Action', 'Drama'], ['Action', 'Drama'], 'all')).toBe(true);
		expect(itemMatchesGenreFilter(['Action', 'Drama'], ['Action', 'Comedy'], 'all')).toBe(false);
		expect(itemMatchesGenreFilter(['Action'], ['Action', 'Drama'], 'all')).toBe(false);
	});

	it('treats genre names case-insensitively in all mode', () => {
		expect(itemMatchesGenreFilter(['Action', 'Drama'], ['action', 'drama'], 'all')).toBe(true);
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

describe('isTmdbGenreName', () => {
	it('recognizes official TMDB genre names case-insensitively', () => {
		expect(isTmdbGenreName('Action')).toBe(true);
		expect(isTmdbGenreName('science fiction')).toBe(true);
		expect(isTmdbGenreName('Kaiju')).toBe(false);
	});
});

describe('buildGenreCatalog', () => {
	it('splits custom, catalog TMDB, and classic TMDB genres', () => {
		const catalog = buildGenreCatalog([
			{ metadata: { genres: ['Action', 'Kaiju'] } },
			{ metadata: { genres: ['Drama'] } }
		]);

		expect(catalog.customGenres).toEqual(['Kaiju']);
		expect(catalog.catalogTmdbGenres).toEqual(['Action', 'Drama']);
		expect(catalog.classicTmdbGenres).not.toContain('Action');
		expect(catalog.classicTmdbGenres).toContain('Comedy');
	});
});

describe('toggleGenreSelection', () => {
	it('adds and removes genres from a draft selection', () => {
		expect(toggleGenreSelection(['Action'], 'Drama')).toEqual(['Action', 'Drama']);
		expect(toggleGenreSelection(['Action', 'Drama'], 'action')).toEqual(['Drama']);
	});
});
