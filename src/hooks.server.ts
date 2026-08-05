import { building } from '$app/environment';
import { type Handle, type HandleServerError, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { ensureAdminUser } from '$lib/server/auth/seed';
import { SESSION_COOKIE, validateSession } from '$lib/server/auth/session';
import { getDb } from '$lib/server/db';

const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'"
	);
	return response;
};

const database: Handle = async ({ event, resolve }) => {
	event.locals.db = getDb(event.platform);
	return resolve(event);
};

const auth: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	event.locals.user = token ? await validateSession(event.locals.db, token) : null;
	return resolve(event);
};

const adminGuard: Handle = async ({ event, resolve }) => {
	if (event.route.id?.startsWith('/admin') && !event.locals.user) {
		throw redirect(303, '/login');
	}

	return resolve(event);
};

const bootstrap: Handle = async ({ event, resolve }) => {
	if (!building) {
		await ensureAdminUser(event.locals.db);
	}
	return resolve(event);
};

export const handle = sequence(securityHeaders, database, auth, adminGuard, bootstrap);

export const handleError: HandleServerError = ({ error }) => {
	if (!building) {
		console.error(error);
	}

	return {
		message: 'Something went wrong. Please try again.'
	};
};
