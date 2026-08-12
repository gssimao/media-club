import { CfWorkerJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/cfworker-provider.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCollectionTools } from '$lib/server/mcp/tools/collections';
import { registerItemTools } from '$lib/server/mcp/tools/items';
import { registerSearchTools } from '$lib/server/mcp/tools/search';

export function createMcpServer(): McpServer {
	const server = new McpServer(
		{
			name: 'media-club',
			version: '1.0.0'
		},
		{
			instructions:
				'Media Club catalog assistant. Search external APIs first with search_media, confirm the match with the user, then add items. owned = items you have; wishlist = want list. Albums are shelves that group owned items within a category.',
			jsonSchemaValidator: new CfWorkerJsonSchemaValidator()
		}
	);

	registerSearchTools(server);
	registerItemTools(server);
	registerCollectionTools(server);

	return server;
}
