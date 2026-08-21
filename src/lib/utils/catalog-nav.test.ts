import { describe, expect, it } from 'vitest';
import { getCatalogSkeletonConfig } from '$lib/utils/catalog-nav';

describe('getCatalogSkeletonConfig', () => {
	it('returns category skeleton for browse routes', () => {
		expect(getCatalogSkeletonConfig('/movies')).toEqual({
			title: 'Movies',
			showShelf: true,
			variant: 'category'
		});
	});

	it('returns wishlist skeleton', () => {
		expect(getCatalogSkeletonConfig('/wishlist/music')).toEqual({
			title: 'Wishlist',
			showShelf: false,
			variant: 'wishlist'
		});
	});

	it('returns album detail skeleton', () => {
		expect(getCatalogSkeletonConfig('/albums/movie/abc')).toEqual({
			title: 'Collection',
			showShelf: false,
			variant: 'album-detail'
		});
	});

	it('returns null for unrelated routes', () => {
		expect(getCatalogSkeletonConfig('/settings')).toBeNull();
		expect(getCatalogSkeletonConfig(undefined)).toBeNull();
	});
});
