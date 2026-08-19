import { z } from 'zod';
import {
	assignItemToAlbum,
	createAlbum,
	deleteAlbum,
	getAlbumById,
	listAlbumsByCategory
} from '$lib/server/albums';
import { getItemById } from '$lib/server/items';
import { getMcpContext, logMcpTool } from '$lib/server/mcp/context';
import { toolFailure, toolSuccess } from '$lib/server/mcp/response';
import { categorySchema } from '$lib/server/mcp/schemas';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerCollectionTools(server: McpServer) {
	server.registerTool(
		'list_albums',
		{
			description: 'List collections within a category, with item counts.',
			inputSchema: {
				category: categorySchema
			}
		},
		async ({ category }) => {
			const ctx = getMcpContext();
			logMcpTool('list_albums', category);
			return toolSuccess(await listAlbumsByCategory(ctx.db, category));
		}
	);

	server.registerTool(
		'create_album',
		{
			description: 'Create a new collection to group owned items within a category.',
			inputSchema: {
				category: categorySchema,
				title: z.string().min(1).describe('Collection title'),
				description: z.string().nullable().optional().describe('Optional description')
			}
		},
		async ({ category, title, description }) => {
			const ctx = getMcpContext();
			logMcpTool('create_album', `${category} "${title}"`);
			const album = await createAlbum(ctx.db, {
				category,
				title,
				description: description ?? null
			});
			if (!album) return toolFailure('Failed to create collection');
			return toolSuccess(album);
		}
	);

	server.registerTool(
		'delete_album',
		{
			description: 'Delete a collection. Items in it are unlinked but remain in the catalog.',
			inputSchema: {
				id: z.string().describe('Collection id')
			}
		},
		async ({ id }) => {
			const ctx = getMcpContext();
			logMcpTool('delete_album', id);
			const existing = await getAlbumById(ctx.db, id);
			if (!existing) return toolFailure(`Collection not found: ${id}`);

			await deleteAlbum(ctx.db, id);
			return toolSuccess({ removed: true, id });
		}
	);

	server.registerTool(
		'assign_to_album',
		{
			description: 'Assign an owned media item to a collection.',
			inputSchema: {
				itemId: z.string().describe('Media item id'),
				albumId: z.string().describe('Collection id')
			}
		},
		async ({ itemId, albumId }) => {
			const ctx = getMcpContext();
			logMcpTool('assign_to_album', `${itemId} -> ${albumId}`);

			const item = await getItemById(ctx.db, itemId);
			if (!item) return toolFailure(`Item not found: ${itemId}`);
			if (item.listType !== 'owned') {
				return toolFailure('Only owned items can be assigned to a collection');
			}

			const ok = await assignItemToAlbum(ctx.db, itemId, albumId);
			if (!ok) return toolFailure('Could not assign item to collection');

			return toolSuccess(await getItemById(ctx.db, itemId));
		}
	);

	server.registerTool(
		'remove_from_album',
		{
			description: 'Remove a media item from its collection. The item stays in the catalog.',
			inputSchema: {
				itemId: z.string().describe('Media item id')
			}
		},
		async ({ itemId }) => {
			const ctx = getMcpContext();
			logMcpTool('remove_from_album', itemId);

			const item = await getItemById(ctx.db, itemId);
			if (!item) return toolFailure(`Item not found: ${itemId}`);

			const ok = await assignItemToAlbum(ctx.db, itemId, null);
			if (!ok) return toolFailure('Could not remove item from collection');

			return toolSuccess(await getItemById(ctx.db, itemId));
		}
	);
}
