import { AsyncLocalStorage } from 'node:async_hooks';
import type { AppDatabase } from '$lib/server/db';

export interface McpContext {
	db: AppDatabase;
	platform: App.Platform | undefined;
	clientIp: string;
	rateLimitKey: string;
}

const storage = new AsyncLocalStorage<McpContext>();

export function runWithMcpContext<T>(ctx: McpContext, fn: () => T): T {
	return storage.run(ctx, fn);
}

export function getMcpContext(): McpContext {
	const ctx = storage.getStore();
	if (!ctx) {
		throw new Error('MCP context is not available');
	}
	return ctx;
}

export function logMcpTool(tool: string, detail?: string) {
	console.info(`[mcp] ${tool}${detail ? `: ${detail}` : ''}`);
}
