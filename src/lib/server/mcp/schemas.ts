import { z } from 'zod';

export const categorySchema = z.enum(['movie', 'music', 'book']);
export const listTypeSchema = z.enum(['owned', 'wishlist']);

export const searchResultFields = {
	externalId: z.string().describe('Provider ID from search_media'),
	title: z.string().describe('Item title'),
	subtitle: z.string().nullable().optional().describe('Artist, author, or secondary title'),
	year: z.number().nullable().optional().describe('Release or publication year'),
	coverUrl: z.string().nullable().optional().describe('Cover image URL'),
	metadata: z.record(z.string(), z.unknown()).optional().describe('Provider metadata object'),
	notes: z.string().nullable().optional().describe('Optional notes')
};

export const ownedAlbumIdField = {
	albumId: z.string().nullable().optional().describe('Optional collection id (owned items only)')
};
