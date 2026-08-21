import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const albums = sqliteTable(
	'albums',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		category: text('category', { enum: ['movie', 'show', 'music', 'book'] }).notNull(),
		title: text('title').notNull(),
		description: text('description'),
		coverUrl: text('cover_url'),
		accentColor: text('accent_color'),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [index('albums_category_idx').on(table.category)]
);

export const items = sqliteTable(
	'items',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		category: text('category', { enum: ['movie', 'show', 'music', 'book'] }).notNull(),
		listType: text('list_type', { enum: ['owned', 'wishlist'] }).notNull(),
		albumId: text('album_id').references(() => albums.id, { onDelete: 'set null' }),
		externalId: text('external_id').notNull(),
		title: text('title').notNull(),
		subtitle: text('subtitle'),
		year: integer('year'),
		coverUrl: text('cover_url'),
		metadata: text('metadata'),
		notes: text('notes'),
		albumWatchedAt: integer('album_watched_at', { mode: 'timestamp' }),
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
		),
		index('items_album_id_idx').on(table.albumId)
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

export const streamingLists = sqliteTable('streaming_lists', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	description: text('description'),
	coverUrl: text('cover_url'),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const streamingListItems = sqliteTable(
	'streaming_list_items',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		listId: text('list_id')
			.notNull()
			.references(() => streamingLists.id, { onDelete: 'cascade' }),
		externalId: text('external_id').notNull(),
		title: text('title').notNull(),
		subtitle: text('subtitle'),
		year: integer('year'),
		coverUrl: text('cover_url'),
		metadata: text('metadata'),
		watchedAt: integer('watched_at', { mode: 'timestamp' }),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		uniqueIndex('streaming_list_items_list_external_idx').on(table.listId, table.externalId),
		index('streaming_list_items_list_id_idx').on(table.listId)
	]
);

export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type AdminUser = typeof adminUser.$inferSelect;
export type Session = typeof session.$inferSelect;
export type StreamingList = typeof streamingLists.$inferSelect;
export type NewStreamingList = typeof streamingLists.$inferInsert;
export type StreamingListItem = typeof streamingListItems.$inferSelect;
export type NewStreamingListItem = typeof streamingListItems.$inferInsert;
