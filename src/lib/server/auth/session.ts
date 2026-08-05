import { eq, lt } from 'drizzle-orm';
import { encodeHexLowerCase } from '@oslojs/encoding';
import type { AppDatabase } from '$lib/server/db';
import { adminUser, session } from '$lib/server/db/schema';

const SESSION_COOKIE = 'media_club_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export function createSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return encodeHexLowerCase(bytes);
}

export async function createSession(db: AppDatabase, userId: string): Promise<string> {
	const id = createSessionToken();
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

	await db.insert(session).values({ id, userId, expiresAt });
	return id;
}

export async function validateSession(db: AppDatabase, token: string) {
	const rows = await db.select().from(session).where(eq(session.id, token)).limit(1);
	const current = rows[0];
	if (!current) return null;

	if (current.expiresAt.getTime() <= Date.now()) {
		await db.delete(session).where(eq(session.id, token));
		return null;
	}

	const users = await db.select().from(adminUser).where(eq(adminUser.id, current.userId)).limit(1);
	return users[0] ?? null;
}

export async function invalidateSession(db: AppDatabase, token: string) {
	await db.delete(session).where(eq(session.id, token));
}

export async function invalidateAllSessions(db: AppDatabase, userId: string) {
	await db.delete(session).where(eq(session.userId, userId));
}

export async function cleanExpiredSessions(db: AppDatabase) {
	await db.delete(session).where(lt(session.expiresAt, new Date()));
}

export function sessionCookieOptions(secure: boolean) {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure,
		maxAge: SESSION_DURATION_MS / 1000
	};
}

export { SESSION_COOKIE, SESSION_DURATION_MS };
