import { listAlbumsByCategory, resolveAlbumCoverUrls } from '$lib/server/albums';
import { listUngroupedItems } from '$lib/server/items';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [albums, items] = await Promise.all([
		listAlbumsByCategory(locals.db, 'movie'),
		listUngroupedItems(locals.db, 'movie', 'owned')
	]);
	const coverUrls = await resolveAlbumCoverUrls(locals.db, albums);

	return {
		albums,
		coverUrls,
		items,
		isAdmin: Boolean(locals.user)
	};
};
