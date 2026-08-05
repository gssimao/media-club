import { listItems } from '$lib/server/items';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const items = await listItems(locals.db, 'movie', 'owned');
	return { items, isAdmin: Boolean(locals.user) };
};
