import { MAX_NOTES_LENGTH, MAX_TITLE_LENGTH, sanitizeHttpUrl } from '$lib/server/admin';
import type { AppDatabase } from '$lib/server/db';
import { addItem } from '$lib/server/items';
import { isListType, isMediaCategory, type ListType, type MediaCategory } from '$lib/types/media';

export const MAX_IMPORT_ITEMS = 250;
export const MAX_IMPORT_PAYLOAD_CHARS = 512_000;

export interface ImportItemInput {
	category: MediaCategory;
	listType: ListType;
	externalId: string;
	title: string;
	subtitle: string | null;
	year: number | null;
	coverUrl: string | null;
	metadata?: Record<string, unknown>;
	notes?: string | null;
}

export interface ImportItemsResult {
	inserted: number;
	skipped: number;
	errors: string[];
}

const GROUP_KEYS: Record<string, { category: MediaCategory; listType: ListType }> = {
	movies: { category: 'movie', listType: 'owned' },
	music: { category: 'music', listType: 'owned' },
	books: { category: 'book', listType: 'owned' }
};

function parseYear(value: unknown): number | null {
	if (value === null || value === undefined || value === '') return null;
	const year = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
	return Number.isNaN(year) ? null : year;
}

function normalizeRawItem(
	raw: unknown,
	defaults?: { category?: MediaCategory; listType?: ListType },
	label?: string
): ImportItemInput {
	if (!raw || typeof raw !== 'object') {
		throw new Error(`${label ?? 'Item'} must be an object.`);
	}

	const entry = raw as Record<string, unknown>;
	const categoryRaw = entry.category ?? defaults?.category;
	const listTypeRaw = entry.listType ?? defaults?.listType;

	if (typeof categoryRaw !== 'string' || !isMediaCategory(categoryRaw)) {
		throw new Error(`${label ?? 'Item'} needs a valid category (movie, music, book).`);
	}
	if (typeof listTypeRaw !== 'string' || !isListType(listTypeRaw)) {
		throw new Error(`${label ?? 'Item'} needs a valid listType (owned, wishlist).`);
	}

	const externalId = String(entry.externalId ?? '').trim();
	const title = String(entry.title ?? '').trim();
	if (!externalId) throw new Error(`${label ?? 'Item'} is missing externalId.`);
	if (!title) throw new Error(`${label ?? 'Item'} is missing title.`);
	if (title.length > MAX_TITLE_LENGTH) {
		throw new Error(`${label ?? 'Item'} title is too long.`);
	}

	let metadata: Record<string, unknown> | undefined;
	if (entry.metadata && typeof entry.metadata === 'object' && !Array.isArray(entry.metadata)) {
		metadata = entry.metadata as Record<string, unknown>;
	}

	const notesRaw = entry.notes;
	const notes =
		notesRaw === null || notesRaw === undefined
			? null
			: String(notesRaw).trim().slice(0, MAX_NOTES_LENGTH) || null;

	const subtitleRaw = entry.subtitle;
	const subtitle =
		subtitleRaw === null || subtitleRaw === undefined ? null : String(subtitleRaw).trim() || null;

	return {
		category: categoryRaw,
		listType: listTypeRaw,
		externalId,
		title,
		subtitle,
		year: parseYear(entry.year),
		coverUrl: sanitizeHttpUrl(typeof entry.coverUrl === 'string' ? entry.coverUrl : null),
		metadata,
		notes
	};
}

/** Parse admin bulk-import JSON into normalized item rows. */
export function parseImportPayload(rawJson: string): ImportItemInput[] {
	const trimmed = rawJson.trim();
	if (!trimmed) throw new Error('JSON payload is empty.');
	if (trimmed.length > MAX_IMPORT_PAYLOAD_CHARS) {
		throw new Error(`JSON payload exceeds ${MAX_IMPORT_PAYLOAD_CHARS} characters.`);
	}

	let data: unknown;
	try {
		data = JSON.parse(trimmed) as unknown;
	} catch {
		throw new Error('Invalid JSON — check commas, quotes, and brackets.');
	}

	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		throw new Error('JSON root must be an object.');
	}

	const root = data as Record<string, unknown>;
	const items: ImportItemInput[] = [];

	if (Array.isArray(root.items)) {
		root.items.forEach((entry, index) => {
			items.push(normalizeRawItem(entry, undefined, `items[${index}]`));
		});
	} else {
		for (const [key, defaults] of Object.entries(GROUP_KEYS)) {
			const group = root[key];
			if (group === undefined) continue;
			if (!Array.isArray(group)) {
				throw new Error(`"${key}" must be an array when present.`);
			}
			group.forEach((entry, index) => {
				items.push(normalizeRawItem(entry, defaults, `${key}[${index}]`));
			});
		}

		const wishlist = root.wishlist;
		if (wishlist !== undefined) {
			if (!Array.isArray(wishlist)) throw new Error('"wishlist" must be an array when present.');
			wishlist.forEach((entry, index) => {
				items.push(
					normalizeRawItem(entry, { listType: 'wishlist' }, `wishlist[${index}]`)
				);
			});
		}
	}

	if (items.length === 0) {
		throw new Error(
			'No items found. Use an "items" array or group keys: movies, music, books, wishlist.'
		);
	}
	if (items.length > MAX_IMPORT_ITEMS) {
		throw new Error(`Too many items (${items.length}). Maximum per import is ${MAX_IMPORT_ITEMS}.`);
	}

	return items;
}

export async function importItemsFromJson(
	db: AppDatabase,
	rawJson: string
): Promise<ImportItemsResult> {
	const items = parseImportPayload(rawJson);
	let inserted = 0;
	let skipped = 0;
	const errors: string[] = [];

	for (const item of items) {
		try {
			const result = await addItem(
				db,
				item.category,
				item.listType,
				{
					externalId: item.externalId,
					title: item.title,
					subtitle: item.subtitle,
					year: item.year,
					coverUrl: item.coverUrl,
					metadata: item.metadata
				},
				{ notes: item.notes ?? null }
			);
			if (result.inserted) inserted += 1;
			else skipped += 1;
		} catch (error) {
			const label = `${item.listType}/${item.category}/${item.externalId}`;
			errors.push(
				`${label}: ${error instanceof Error ? error.message : 'Could not import item.'}`
			);
		}
	}

	return { inserted, skipped, errors };
}
