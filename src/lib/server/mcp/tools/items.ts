import { z } from 'zod';
import {
	deleteItem,
	getItemById,
	getItemCounts,
	listItemsFiltered,
	moveToOwned,
	updateItemNotes
} from '$lib/server/items';
import { getMcpContext, logMcpTool } from '$lib/server/mcp/context';
import { toolFailure, toolSuccess } from '$lib/server/mcp/response';
import {
	categorySchema,
	listTypeSchema,
	ownedAlbumIdField,
	searchResultFields
} from '$lib/server/mcp/schemas';
import { mcpAddMediaItem } from '$lib/server/mcp/tools/add';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerItemTools(server: McpServer) {
	server.registerTool(
		'list_media',
		{
			description:
				'List media items. Defaults to ungrouped items (not in a collection), matching the category pages. owned = items you have, wishlist = want list.',
			inputSchema: {
				category: categorySchema,
				listType: listTypeSchema,
				ungrouped: z
					.boolean()
					.optional()
					.default(true)
					.describe('When true (default), only items not assigned to a collection'),
				albumId: z
					.string()
					.optional()
					.describe('When set, list items in this collection instead of ungrouped filter'),
				includeAll: z
					.boolean()
					.optional()
					.describe('When true, return all items regardless of collection assignment')
			}
		},
		async ({ category, listType, ungrouped, albumId, includeAll }) => {
			const ctx = getMcpContext();
			logMcpTool('list_media', `${category}/${listType}`);

			const options = includeAll
				? undefined
				: albumId
					? { albumId }
					: { ungrouped: ungrouped ?? true };

			const items = await listItemsFiltered(ctx.db, category, listType, options);
			return toolSuccess(items);
		}
	);

	server.registerTool(
		'get_media_item',
		{
			description: 'Get a single media item by id.',
			inputSchema: {
				id: z.string().describe('Media item id')
			}
		},
		async ({ id }) => {
			const ctx = getMcpContext();
			logMcpTool('get_media_item', id);
			const item = await getItemById(ctx.db, id);
			if (!item) return toolFailure(`Item not found: ${id}`);
			return toolSuccess(item);
		}
	);

	server.registerTool(
		'get_catalog_stats',
		{
			description: 'Get item counts grouped by category and list type (e.g. movie:owned).'
		},
		async () => {
			const ctx = getMcpContext();
			logMcpTool('get_catalog_stats');
			return toolSuccess(await getItemCounts(ctx.db));
		}
	);

	server.registerTool(
		'add_media_item',
		{
			description:
				'Add a media item to the catalog. Use search_media first, then pass the result fields. listType owned = collection, wishlist = wishlist.',
			inputSchema: {
				category: categorySchema,
				listType: listTypeSchema,
				...searchResultFields,
				...ownedAlbumIdField
			}
		},
		async (input) => mcpAddMediaItem(input, 'add_media_item')
	);

	server.registerTool(
		'add_to_wishlist',
		{
			description:
				'Add a media item to the wishlist. Convenience wrapper for add_media_item with listType=wishlist.',
			inputSchema: {
				category: categorySchema,
				...searchResultFields
			}
		},
		async ({ category, externalId, title, subtitle, year, coverUrl, metadata, notes }) =>
			mcpAddMediaItem(
				{
					category,
					listType: 'wishlist',
					externalId,
					title,
					subtitle,
					year,
					coverUrl,
					metadata,
					notes
				},
				'add_to_wishlist'
			)
	);

	server.registerTool(
		'move_to_owned',
		{
			description: 'Move a wishlist item into the owned collection.',
			inputSchema: {
				id: z.string().describe('Wishlist item id')
			}
		},
		async ({ id }) => {
			const ctx = getMcpContext();
			logMcpTool('move_to_owned', id);
			const { ok, itemId } = await moveToOwned(ctx.db, id);
			if (!ok || !itemId) return toolFailure('Item not found or not on wishlist');
			const item = await getItemById(ctx.db, itemId);
			return toolSuccess(item);
		}
	);

	server.registerTool(
		'update_media_notes',
		{
			description: 'Add or update free-text notes on a media item. Pass empty string to clear.',
			inputSchema: {
				id: z.string().describe('Media item id'),
				notes: z.string().describe('Notes text (empty string clears notes)')
			}
		},
		async ({ id, notes }) => {
			const ctx = getMcpContext();
			logMcpTool('update_media_notes', id);
			const existing = await getItemById(ctx.db, id);
			if (!existing) return toolFailure(`Item not found: ${id}`);

			await updateItemNotes(ctx.db, id, notes.trim() || null);
			return toolSuccess(await getItemById(ctx.db, id));
		}
	);

	server.registerTool(
		'remove_media_item',
		{
			description: 'Permanently remove a media item from the catalog.',
			inputSchema: {
				id: z.string().describe('Media item id')
			}
		},
		async ({ id }) => {
			const ctx = getMcpContext();
			logMcpTool('remove_media_item', id);
			const existing = await getItemById(ctx.db, id);
			if (!existing) return toolFailure(`Item not found: ${id}`);

			await deleteItem(ctx.db, id);
			return toolSuccess({ removed: true, id });
		}
	);
}
