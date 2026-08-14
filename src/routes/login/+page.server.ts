import { fail, redirect } from '@sveltejs/kit';
import { hashPassword, verifyPassword } from '$lib/server/auth/password';
import { getAdminByUsername } from '$lib/server/auth/seed';
import {
	cleanExpiredSessions,
	createSession,
	sessionCookieOptions,
	SESSION_COOKIE
} from '$lib/server/auth/session';
import { checkRateLimit, clientIp, LOGIN_RATE_LIMIT } from '$lib/server/rate-limit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(303, '/admin');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, url }) => {
		const ip = clientIp(request);
		if (!checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT)) {
			return fail(429, { message: 'Too many login attempts. Try again in a few minutes.' });
		}

		const form = await request.formData();
		const username = String(form.get('username') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!username || !password) {
			return fail(400, { message: 'Username and password are required.' });
		}

		const admin = await getAdminByUsername(locals.db, username);
		if (!admin) {
			// Burn the same PBKDF2 work as a real verification so response timing
			// does not reveal whether the username exists.
			await hashPassword(password);
			return fail(400, { message: 'Invalid username or password.' });
		}

		if (!(await verifyPassword(password, admin.passwordHash))) {
			return fail(400, { message: 'Invalid username or password.' });
		}

		await cleanExpiredSessions(locals.db);
		const token = await createSession(locals.db, admin.id);
		cookies.set(SESSION_COOKIE, token, sessionCookieOptions(url.protocol === 'https:'));

		redirect(303, '/admin');
	}
};
