import { listAlbumsByCategory, resolveAlbumCoverUrls } from '$lib/server/albums';
import { listItems, listItemsFiltered } from '$lib/server/items';
import type { AppDatabase } from '$lib/server/db';
import type { MediaCategory } from '$lib/types/media';

/**
 * Shared loader for /movies, /shows, /music, and /books. Category pages show only
 * ungrouped owned items (albumId IS NULL) plus a collection shelf preview — items
 * assigned to a collection are browsed through /albums/[category] instead.
 * All owned items are also returned for client-side search across collections.
 */
export async function loadCategoryPage(db: AppDatabase, category: MediaCategory, isAdmin: boolean) {
	const [albums, items, allItems] = await Promise.all([
		listAlbumsByCategory(db, category),
		listItemsFiltered(db, category, 'owned', { ungrouped: true }),
		listItems(db, category, 'owned')
	]);
	const coverUrls = await resolveAlbumCoverUrls(db, albums);

	return { albums, coverUrls, items, allItems, isAdmin };
}
