import { getPlatformSecret } from '$lib/server/env';

function safeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;

	let mismatch = 0;
	for (let i = 0; i < a.length; i++) {
		mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return mismatch === 0;
}

export function extractBearerToken(request: Request): string | null {
	const header = request.headers.get('Authorization');
	if (!header?.startsWith('Bearer ')) return null;
	return header.slice('Bearer '.length);
}

export function validateMcpAuth(request: Request, platform: App.Platform | undefined): boolean {
	const expected = getPlatformSecret(platform, 'MCP_API_KEY');
	if (!expected) {
		console.warn('[mcp] MCP_API_KEY is not configured — rejecting request');
		return false;
	}

	const token = extractBearerToken(request);
	if (!token) return false;

	return safeEqual(token, expected);
}

export async function mcpRateLimitKey(request: Request, clientIp: string): Promise<string> {
	const token = extractBearerToken(request);
	if (!token) return `mcp-ip:${clientIp}`;

	const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
	const hex = Array.from(new Uint8Array(hash))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
	return `mcp-key:${hex.slice(0, 16)}`;
}

export function mcpUnauthorizedResponse(): Response {
	return new Response(JSON.stringify({ error: 'Unauthorized' }), {
		status: 401,
		headers: { 'Content-Type': 'application/json' }
	});
}
