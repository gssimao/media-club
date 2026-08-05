import { redirect } from '@sveltejs/kit';
import { invalidateSession, SESSION_COOKIE } from '$lib/server/auth/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	const token = cookies.get(SESSION_COOKIE);
	if (token) {
		await invalidateSession(locals.db, token);
	}

	cookies.delete(SESSION_COOKIE, { path: '/' });
	redirect(303, '/');
};
