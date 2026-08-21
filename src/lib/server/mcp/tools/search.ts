import { getPlatformSecret } from '$lib/server/env';
import { getMcpContext, logMcpTool } from '$lib/server/mcp/context';
import { toolFailure, toolSuccess } from '$lib/server/mcp/response';
import { checkRateLimit } from '$lib/server/rate-limit';
import { searchMusic } from '$lib/server/apis/discogs';
import { searchBooks } from '$lib/server/apis/openlibrary';
import { searchMovies } from '$lib/server/apis/tmdb';
import { categorySchema } from '$lib/server/mcp/schemas';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerSearchTools(server: McpServer) {
	server.registerTool(
		'search_media',
		{
			description:
				'Search TMDB (movies), Discogs (music/vinyl), or Open Library (books) for items to add to the catalog.',
			inputSchema: {
				category: categorySchema.describe('Media category to search'),
				query: z.string().min(2).describe('Search query (minimum 2 characters)')
			}
		},
		async ({ category, query }) => {
			const ctx = getMcpContext();
			logMcpTool('search_media', `${category} "${query}"`);

			if (!checkRateLimit(`search:${ctx.rateLimitKey}`)) {
				return toolFailure('Too many search requests. Try again in a minute.');
			}

			try {
				if (category === 'movie') {
					const apiKey = getPlatformSecret(ctx.platform, 'TMDB_API_KEY');
					if (!apiKey) return toolFailure('TMDB_API_KEY is not configured');
					const page = await searchMovies(apiKey, query);
					return toolSuccess(page.results);
				}

				if (category === 'music') {
					const token = getPlatformSecret(ctx.platform, 'DISCOGS_TOKEN');
					if (!token) return toolFailure('DISCOGS_TOKEN is not configured');
					const page = await searchMusic(token, query);
					return toolSuccess(page.results);
				}

				const page = await searchBooks(query);
				return toolSuccess(page.results);
			} catch (err) {
				console.error('[mcp] search_media failed', err);
				return toolFailure('Search provider failed');
			}
		}
	);
}
