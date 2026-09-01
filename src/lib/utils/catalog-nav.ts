export interface CatalogSkeletonConfig {
	title: string;
	showShelf: boolean;
	variant: 'category' | 'wishlist' | 'album-detail' | 'album-library';
}

const CATEGORY_TITLES: Record<string, string> = {
	movies: 'Movies',
	shows: 'Shows',
	music: 'Music',
	books: 'Books'
};

/** Returns skeleton config when navigating to a catalog browse route, else null. */
export function getCatalogSkeletonConfig(
	pathname: string | undefined
): CatalogSkeletonConfig | null {
	if (!pathname) return null;

	const segments = pathname.split('/').filter(Boolean);

	if (segments.length === 1 && segments[0] in CATEGORY_TITLES) {
		return {
			title: CATEGORY_TITLES[segments[0]!]!,
			showShelf: true,
			variant: 'category'
		};
	}

	if (segments[0] === 'shows' && segments[1] === 'watching') {
		return { title: 'Show tracker', showShelf: false, variant: 'wishlist' };
	}

	if (segments[0] === 'wishlist' && segments.length === 2) {
		return { title: 'Wishlist', showShelf: false, variant: 'wishlist' };
	}

	if (segments[0] === 'albums' && segments.length === 3) {
		return { title: 'Collection', showShelf: false, variant: 'album-detail' };
	}

	if (segments[0] === 'albums' && segments.length === 2) {
		return { title: 'Collections', showShelf: false, variant: 'album-library' };
	}

	return null;
}
