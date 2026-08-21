import { loadCategoryPage } from '$lib/server/category-page';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return loadCategoryPage(locals.db, 'show', Boolean(locals.user));
};
