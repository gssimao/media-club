import { getRecentItems } from '$lib/server/items';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const recent = await getRecentItems(locals.db);
	return { recent, user: locals.user };
};
