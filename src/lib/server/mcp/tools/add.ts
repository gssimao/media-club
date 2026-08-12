import { addItem, getItemById } from '$lib/server/items';
import { getMcpContext, logMcpTool } from '$lib/server/mcp/context';
import { toolFailure, toolSuccess } from '$lib/server/mcp/response';
import type { ListType, MediaCategory, SearchResult } from '$lib/types/media';

export interface McpAddItemInput {
	category: MediaCategory;
	listType: ListType;
	externalId: string;
	title: string;
	subtitle?: string | null;
	year?: number | null;
	coverUrl?: string | null;
	metadata?: Record<string, unknown>;
	notes?: string | null;
	albumId?: string | null;
}

export async function mcpAddMediaItem(input: McpAddItemInput, toolName: string) {
	const ctx = getMcpContext();
	logMcpTool(toolName, `${input.category}/${input.listType} ${input.title}`);

	try {
		const searchResult: SearchResult = {
			externalId: input.externalId,
			title: input.title,
			subtitle: input.subtitle ?? null,
			year: input.year ?? null,
			coverUrl: input.coverUrl ?? null,
			metadata: input.metadata
		};

		const result = await addItem(ctx.db, input.category, input.listType, searchResult, {
			notes: input.notes ?? null,
			albumId: input.albumId ?? null
		});

		if (!result.id) {
			return toolFailure('Failed to add item');
		}

		if (!result.inserted) {
			return toolSuccess({
				inserted: false,
				message: 'Item already exists in catalog',
				item: await getItemById(ctx.db, result.id)
			});
		}

		return toolSuccess({
			inserted: true,
			item: await getItemById(ctx.db, result.id)
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to add item';
		return toolFailure(message);
	}
}
