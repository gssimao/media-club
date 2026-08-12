import { fail, redirect } from '@sveltejs/kit';
import {
	assignItemToAlbum,
	createAlbum,
	deleteAlbum,
	updateAlbum
} from '$lib/server/albums';
import { isMediaCategory } from '$lib/types/media';
import type { Actions } from './$types';

function requireAdmin(locals: App.Locals) {
	if (!locals.user) {
		redirect(303, '/login');
	}
}

export const actions: Actions = {
	createAlbum: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const category = String(form.get('category') ?? '');
		const title = String(form.get('title') ?? '').trim();
		const description = form.get('description')
			? String(form.get('description')).trim()
			: null;

		if (!isMediaCategory(category) || !title) {
			return fail(400, { message: 'Category and title are required.' });
		}

		await createAlbum(locals.db, category, title, description);
		return { success: true };
	},

	updateAlbum: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const title = String(form.get('title') ?? '').trim();
		const description = form.get('description')
			? String(form.get('description')).trim()
			: null;
		const coverUrl = form.get('coverUrl') ? String(form.get('coverUrl')).trim() : null;

		if (!id || !title) {
			return fail(400, { message: 'Album id and title are required.' });
		}

		await updateAlbum(locals.db, id, { title, description, coverUrl });
		return { success: true };
	},

	deleteAlbum: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing album id.' });

		await deleteAlbum(locals.db, id);
		return { success: true };
	},

	assignToAlbum: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const itemId = String(form.get('itemId') ?? '');
		const albumIdRaw = form.get('albumId');
		const albumId = albumIdRaw ? String(albumIdRaw) : null;

		if (!itemId) return fail(400, { message: 'Missing item id.' });

		const ok = await assignItemToAlbum(locals.db, itemId, albumId);
		if (!ok) return fail(400, { message: 'Could not assign item to album.' });

		return { success: true };
	}
};
