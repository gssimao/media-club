import { error } from '@sveltejs/kit';
import { getAlbum, listItemsInAlbum, resolveAlbumCoverUrl } from '$lib/server/albums';
import { albums as albumsTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { CATEGORY_LABELS, isMediaCategory } from '$lib/types/media';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!isMediaCategory(params.category)) {
		error(404, 'Not found');
	}

	const album = await getAlbum(locals.db, params.albumId);
	if (!album || album.category !== params.category) {
		error(404, 'Album not found');
	}

	const items = await listItemsInAlbum(locals.db, album.id);

	const row = await locals.db
		.select()
		.from(albumsTable)
		.where(eq(albumsTable.id, album.id))
		.limit(1);
	const displayCoverUrl = row[0]
		? await resolveAlbumCoverUrl(locals.db, row[0])
		: album.coverUrl;

	return {
		category: params.category,
		label: CATEGORY_LABELS[params.category],
		album,
		items,
		displayCoverUrl,
		isAdmin: Boolean(locals.user)
	};
};
