import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { validateMcpAuth, mcpUnauthorizedResponse, mcpRateLimitKey } from '$lib/server/mcp/auth';
import { runWithMcpContext } from '$lib/server/mcp/context';
import { createMcpServer } from '$lib/server/mcp/server';
import { clientIp } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

const handleMcp: RequestHandler = async (event) => {
	if (!validateMcpAuth(event.request, event.platform)) {
		return mcpUnauthorizedResponse();
	}

	const ctx = {
		db: event.locals.db,
		platform: event.platform,
		clientIp: clientIp(event.request),
		rateLimitKey: await mcpRateLimitKey(event.request, clientIp(event.request))
	};

	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined
	});

	const server = createMcpServer();
	await server.connect(transport);

	try {
		return await runWithMcpContext(ctx, () => transport.handleRequest(event.request));
	} finally {
		await server.close();
	}
};

export const GET = handleMcp;
export const POST = handleMcp;
export const DELETE = handleMcp;
