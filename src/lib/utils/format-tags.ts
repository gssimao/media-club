import type { MediaCategory, MediaItem } from '$lib/types/media';

export const FORMAT_TAG_PRESETS: Record<MediaCategory, string[]> = {
	movie: ['DVD', 'Blu-ray', '4K'],
	music: ['Vinyl', 'CD', 'Cassette'],
	book: ['Hardcover', 'Paperback']
};

const ALL_FORMAT_TAGS = new Set(Object.values(FORMAT_TAG_PRESETS).flat());

/** Returns null when metadata has no explicit tags field (legacy notes fallback applies). */
export function parseTagsFromMetadata(metadata: Record<string, unknown> | null): string[] | null {
	if (!metadata || !('tags' in metadata)) return null;
	const tags = metadata.tags;
	if (Array.isArray(tags)) {
		return tags.filter((t): t is string => typeof t === 'string');
	}
	return [];
}

export function isFormatLikeNote(notes: string | null): boolean {
	if (!notes) return false;
	return ALL_FORMAT_TAGS.has(notes.trim());
}

export function getDisplayTags(item: MediaItem): string[] {
	const fromMeta = parseTagsFromMetadata(item.metadata);
	if (fromMeta !== null) return fromMeta;
	if (isFormatLikeNote(item.notes)) return [item.notes!.trim()];
	return [];
}

export function getDisplayNotes(item: MediaItem): string | null {
	if (!item.notes) return null;
	if (isFormatLikeNote(item.notes) && getDisplayTags(item).includes(item.notes.trim())) {
		return null;
	}
	return item.notes;
}

export function toggleTag(current: string[], tag: string): string[] {
	return current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
}
