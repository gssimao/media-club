import { error, fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import {
	assignItemsToAlbum,
	getAlbum,
	listAlbumsByCategory,
	MAX_COLLECTION_SELECTION
} from '$lib/server/albums';
import { listItems } from '$lib/server/items';
import { CATEGORY_LABELS, isMediaCategory } from '$lib/types/media';
import type { Actions, PageServerLoad } from './$types';

async function collection(locals: App.Locals, category: string, albumId: string) {
	requireAdmin(locals);
	if (!isMediaCategory(category)) error(404, 'Not found');
	const album = await getAlbum(locals.db, albumId);
	if (!album || album.category !== category) error(404, 'Collection not found');
	return album;
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const album = await collection(locals, params.category, params.albumId);
	const [items, albums] = await Promise.all([
		listItems(locals.db, album.category, 'owned'),
		listAlbumsByCategory(locals.db, album.category)
	]);
	return { album, items, albums, label: CATEGORY_LABELS[album.category] };
};

export const actions: Actions = {
	default: async ({ locals, params, request }) => {
		const album = await collection(locals, params.category, params.albumId);
		const form = await request.formData();
		const rawIds = form.getAll('ids');
		if (rawIds.length > MAX_COLLECTION_SELECTION || rawIds.some((id) => typeof id !== 'string')) {
			return fail(400, { message: 'Invalid selection.' });
		}
		const result = await assignItemsToAlbum(
			locals.db,
			album.id,
			rawIds as string[],
			form.get('allowMove') === 'true'
		);
		if (!result.ok) return fail(409, { message: result.message });
		redirect(303, `/albums/${album.category}/${album.id}`);
	}
};
