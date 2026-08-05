import { fail, redirect } from '@sveltejs/kit';
import { verifyPassword } from '$lib/server/auth/password';
import { getAdminByUsername } from '$lib/server/auth/seed';
import { createSession, sessionCookieOptions, SESSION_COOKIE } from '$lib/server/auth/session';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(303, '/admin');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, url }) => {
		const form = await request.formData();
		const username = String(form.get('username') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!username || !password) {
			return fail(400, { message: 'Username and password are required.' });
		}

		const admin = await getAdminByUsername(locals.db, username);
		if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
			return fail(400, { message: 'Invalid username or password.' });
		}

		const token = await createSession(locals.db, admin.id);
		cookies.set(SESSION_COOKIE, token, sessionCookieOptions(url.protocol === 'https:'));

		redirect(303, '/admin');
	}
};
