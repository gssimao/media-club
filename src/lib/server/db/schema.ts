import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const items = sqliteTable(
	'items',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		category: text('category', { enum: ['movie', 'music', 'book'] }).notNull(),
		listType: text('list_type', { enum: ['owned', 'wishlist'] }).notNull(),
		externalId: text('external_id').notNull(),
		title: text('title').notNull(),
		subtitle: text('subtitle'),
		year: integer('year'),
		coverUrl: text('cover_url'),
		metadata: text('metadata'),
		notes: text('notes'),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		uniqueIndex('items_category_external_list_idx').on(
			table.category,
			table.externalId,
			table.listType
		)
	]
);

export const adminUser = sqliteTable('admin_user', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => adminUser.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type AdminUser = typeof adminUser.$inferSelect;
export type Session = typeof session.$inferSelect;
