import { count, eq } from 'drizzle-orm';
import type { AppDatabase } from '$lib/server/db';
import { adminUser } from '$lib/server/db/schema';
import { hashPassword } from './password';

export async function ensureAdminUser(db: AppDatabase, platform?: App.Platform) {
	const [{ value }] = await db.select({ value: count() }).from(adminUser);
	if (value > 0) return;

	const env = platform?.env as Record<string, string | undefined> | undefined;
	const username = env?.ADMIN_USERNAME ?? process.env.ADMIN_USERNAME ?? 'admin';
	const password = env?.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;

	if (!password) {
		console.warn('[media-club] ADMIN_PASSWORD is not set; skipping admin seed.');
		return;
	}

	await db.insert(adminUser).values({
		username,
		passwordHash: await hashPassword(password)
	});
}

export async function getAdminByUsername(db: AppDatabase, username: string) {
	const rows = await db.select().from(adminUser).where(eq(adminUser.username, username)).limit(1);
	return rows[0] ?? null;
}
