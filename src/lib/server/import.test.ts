import { describe, expect, it } from 'vitest';
import { parseImportPayload } from './import';

describe('parseImportPayload', () => {
	it('parses grouped category arrays', () => {
		const items = parseImportPayload(
			JSON.stringify({
				movies: [{ externalId: '1', title: 'A Movie', year: 2020 }],
				wishlist: [{ category: 'book', externalId: 'ol1', title: 'A Book' }]
			})
		);

		expect(items).toHaveLength(2);
		expect(items[0]).toMatchObject({
			category: 'movie',
			listType: 'owned',
			externalId: '1',
			title: 'A Movie',
			year: 2020
		});
		expect(items[1]).toMatchObject({
			category: 'book',
			listType: 'wishlist',
			externalId: 'ol1'
		});
	});

	it('parses a flat items array', () => {
		const items = parseImportPayload(
			JSON.stringify({
				items: [
					{
						category: 'music',
						listType: 'owned',
						externalId: 'vinyl-1',
						title: 'Kind of Blue',
						notes: 'Mono pressing'
					}
				]
			})
		);

		expect(items).toHaveLength(1);
		expect(items[0]?.notes).toBe('Mono pressing');
	});

	it('rejects invalid JSON', () => {
		expect(() => parseImportPayload('{not json')).toThrow(/Invalid JSON/);
	});

	it('requires wishlist entries to declare category', () => {
		expect(() =>
			parseImportPayload(
				JSON.stringify({
					wishlist: [{ externalId: '1', title: 'Missing category' }]
				})
			)
		).toThrow(/category/);
	});
});
