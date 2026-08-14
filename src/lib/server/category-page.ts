import { listAlbumsByCategory, resolveAlbumCoverUrls } from '$lib/server/albums';
import { listItemsFiltered } from '$lib/server/items';
import type { AppDatabase } from '$lib/server/db';
import type { MediaCategory } from '$lib/types/media';

/**
 * Shared loader for /movies, /music, and /books. Category pages show only
 * ungrouped owned items (albumId IS NULL) plus an album shelf preview — items
 * assigned to an album are browsed through /albums/[category] instead.
 */
export async function loadCategoryPage(db: AppDatabase, category: MediaCategory, isAdmin: boolean) {
	const [albums, items] = await Promise.all([
		listAlbumsByCategory(db, category),
		listItemsFiltered(db, category, 'owned', { ungrouped: true })
	]);
	const coverUrls = await resolveAlbumCoverUrls(db, albums);

	return { albums, coverUrls, items, isAdmin };
}
