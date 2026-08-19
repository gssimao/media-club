import { error } from '@sveltejs/kit';
import { getAlbum, listItemsInAlbum, resolveAlbumCoverUrl } from '$lib/server/albums';
import { CATEGORY_LABELS, isMediaCategory } from '$lib/types/media';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!isMediaCategory(params.category)) {
		error(404, 'Not found');
	}

	const album = await getAlbum(locals.db, params.albumId);
	if (!album || album.category !== params.category) {
		error(404, 'Collection not found');
	}

	const items = await listItemsInAlbum(locals.db, album.id);
	const displayCoverUrl = await resolveAlbumCoverUrl(locals.db, album);

	return {
		category: params.category,
		label: CATEGORY_LABELS[params.category],
		album,
		items,
		displayCoverUrl,
		isAdmin: Boolean(locals.user)
	};
};
