import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as schema from '$lib/server/db/schema';
import type { AppDatabase } from '$lib/server/db';
import { cleanExpiredSessions, createSession, invalidateSession, validateSession } from './session';

describe('sessions', () => {
	let sqlite: Database.Database;
	let db: AppDatabase;
	let userId: string;

	beforeAll(async () => {
		sqlite = new Database(':memory:');
		const localDb = drizzle(sqlite, { schema });
		migrate(localDb, { migrationsFolder: join(process.cwd(), 'drizzle') });
		db = localDb as unknown as AppDatabase;

		const [user] = await db
			.insert(schema.adminUser)
			.values({ username: 'admin', passwordHash: 'irrelevant' })
			.returning();
		userId = user.id;
	});

	afterAll(() => {
		sqlite.close();
	});

	it('creates and validates a session', async () => {
		const token = await createSession(db, userId);
		const user = await validateSession(db, token);
		expect(user).toEqual({ id: userId, username: 'admin' });
	});

	it('never exposes the password hash to callers', async () => {
		const token = await createSession(db, userId);
		const user = await validateSession(db, token);
		expect(user).not.toHaveProperty('passwordHash');
	});

	it('stores only a hash of the token at rest', async () => {
		const token = await createSession(db, userId);
		const rows = await db.select().from(schema.session);
		expect(rows.some((row) => row.id === token)).toBe(false);
	});

	it('rejects unknown tokens', async () => {
		expect(await validateSession(db, 'f'.repeat(64))).toBeNull();
	});

	it('invalidates a session', async () => {
		const token = await createSession(db, userId);
		await invalidateSession(db, token);
		expect(await validateSession(db, token)).toBeNull();
	});

	it('rejects and deletes expired sessions', async () => {
		const token = await createSession(db, userId);
		// Force-expire the stored row.
		const rows = await db.select().from(schema.session);
		const active = rows[rows.length - 1];
		await db
			.update(schema.session)
			.set({ expiresAt: new Date(Date.now() - 1000) })
			.where(eq(schema.session.id, active.id));

		expect(await validateSession(db, token)).toBeNull();
	});

	it('cleanExpiredSessions removes only expired rows', async () => {
		const liveToken = await createSession(db, userId);
		const staleToken = await createSession(db, userId);
		const rows = await db.select().from(schema.session);
		const stale = rows[rows.length - 1];
		await db
			.update(schema.session)
			.set({ expiresAt: new Date(Date.now() - 1000) })
			.where(eq(schema.session.id, stale.id));

		await cleanExpiredSessions(db);

		expect(await validateSession(db, liveToken)).not.toBeNull();
		expect(await validateSession(db, staleToken)).toBeNull();
	});
});
