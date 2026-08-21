import { fail } from '@sveltejs/kit';
import {
	finishAdminMutation,
	MAX_DESCRIPTION_LENGTH,
	MAX_TITLE_LENGTH,
	requireAdmin,
	sanitizeAlbumAccentColor,
	sanitizeHttpUrl
} from '$lib/server/admin';
import { redirect } from '@sveltejs/kit';
import {
	assignItemToAlbum,
	createAlbum,
	deleteAlbum,
	getAlbumById,
	updateAlbum
} from '$lib/server/albums';
import { isMediaCategory } from '$lib/types/media';
import type { Actions } from './$types';

export const actions: Actions = {
	createAlbum: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const category = String(form.get('category') ?? '');
		const title = String(form.get('title') ?? '').trim();
		const description = form.get('description')
			? String(form.get('description')).trim().slice(0, MAX_DESCRIPTION_LENGTH)
			: null;

		if (!isMediaCategory(category) || !title || title.length > MAX_TITLE_LENGTH) {
			return fail(400, { message: 'Category and title are required.' });
		}

		await createAlbum(locals.db, { category, title, description });
		finishAdminMutation(request);
	},

	updateAlbum: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const title = String(form.get('title') ?? '').trim();
		const description = form.get('description')
			? String(form.get('description')).trim().slice(0, MAX_DESCRIPTION_LENGTH)
			: null;
		const coverUrl = sanitizeHttpUrl(form.get('coverUrl'));
		const accentColor = sanitizeAlbumAccentColor(form.get('accentColor'));

		if (!id || !title || title.length > MAX_TITLE_LENGTH) {
			return fail(400, { message: 'Collection id and title are required.' });
		}

		await updateAlbum(locals.db, id, { title, description, coverUrl, accentColor });
		finishAdminMutation(request);
	},

	deleteAlbum: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing collection id.' });

		const album = await getAlbumById(locals.db, id);
		await deleteAlbum(locals.db, id);

		// The referer is usually the deleted album's own page, so send the
		// admin to the surviving album library for that category instead.
		redirect(303, album ? `/albums/${album.category}` : '/admin');
	},

	assignToAlbum: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const itemId = String(form.get('itemId') ?? '');
		const albumIdRaw = form.get('albumId');
		const albumId = albumIdRaw ? String(albumIdRaw) : null;

		if (!itemId) return fail(400, { message: 'Missing item id.' });

		const ok = await assignItemToAlbum(locals.db, itemId, albumId);
		if (!ok) return fail(400, { message: 'Could not assign item to collection.' });

		finishAdminMutation(request);
	}
};
