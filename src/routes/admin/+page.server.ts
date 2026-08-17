import { fail } from '@sveltejs/kit';
import { getRecentItems } from '$lib/server/items';
import { importItemsFromJson } from '$lib/server/import';
import { requireAdmin } from '$lib/server/admin';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const recent = await getRecentItems(locals.db);
	return { recent, user: locals.user };
};

export const actions: Actions = {
	importJson: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const payload = String(form.get('payload') ?? '');

		try {
			const result = await importItemsFromJson(locals.db, payload);
			if (result.inserted === 0 && result.errors.length > 0) {
				return fail(400, {
					message: `Import failed. ${result.errors.slice(0, 3).join(' ')}`,
					...result
				});
			}
			return result;
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Could not import JSON.'
			});
		}
	}
};
