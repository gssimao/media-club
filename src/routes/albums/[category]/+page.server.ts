import { error } from '@sveltejs/kit';
import { listAlbumsByCategory, resolveAlbumCoverUrls } from '$lib/server/albums';
import { CATEGORY_LABELS, isMediaCategory } from '$lib/types/media';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!isMediaCategory(params.category)) {
		error(404, 'Not found');
	}

	const category = params.category;
	const albums = await listAlbumsByCategory(locals.db, category);
	const coverUrls = await resolveAlbumCoverUrls(locals.db, albums);

	return {
		category,
		label: CATEGORY_LABELS[category],
		albums,
		coverUrls,
		isAdmin: Boolean(locals.user)
	};
};
