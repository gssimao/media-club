import { describe, expect, it } from 'vitest';
import {
	FORMAT_TAG_PRESETS,
	getDisplayTags,
	isFormatLikeNote,
	parseTagsFromMetadata,
	toggleTag
} from './format-tags';

describe('FORMAT_TAG_PRESETS', () => {
	it('includes Digital for movies, music, and books', () => {
		expect(FORMAT_TAG_PRESETS.movie).toContain('Digital');
		expect(FORMAT_TAG_PRESETS.music).toContain('Digital');
		expect(FORMAT_TAG_PRESETS.book).toContain('Digital');
	});
});

describe('isFormatLikeNote', () => {
	it('recognizes Digital as a format-like note', () => {
		expect(isFormatLikeNote('Digital')).toBe(true);
	});
});

describe('toggleTag', () => {
	it('adds and removes Digital from tag lists', () => {
		expect(toggleTag([], 'Digital')).toEqual(['Digital']);
		expect(toggleTag(['Digital'], 'Digital')).toEqual([]);
	});
});

describe('parseTagsFromMetadata', () => {
	it('returns Digital from metadata tags', () => {
		expect(parseTagsFromMetadata({ tags: ['Digital'] })).toEqual(['Digital']);
	});
});

describe('getDisplayTags', () => {
	it('returns Digital from metadata tags', () => {
		const item = {
			metadata: { tags: ['Digital'] },
			notes: null
		} as unknown as Parameters<typeof getDisplayTags>[0];

		expect(getDisplayTags(item)).toEqual(['Digital']);
	});
});
