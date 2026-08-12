import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
	validateMcpAuth,
	mcpUnauthorizedResponse,
	extractBearerToken,
	mcpRateLimitKey
} from './auth';

describe('validateMcpAuth', () => {
	const originalKey = process.env.MCP_API_KEY;

	beforeEach(() => {
		process.env.MCP_API_KEY = 'test-mcp-key-12345';
	});

	afterEach(() => {
		if (originalKey === undefined) {
			delete process.env.MCP_API_KEY;
		} else {
			process.env.MCP_API_KEY = originalKey;
		}
	});

	it('accepts a valid Bearer token', () => {
		const request = new Request('http://localhost/mcp', {
			headers: { Authorization: 'Bearer test-mcp-key-12345' }
		});
		expect(validateMcpAuth(request, undefined)).toBe(true);
	});

	it('rejects missing Authorization header', () => {
		const request = new Request('http://localhost/mcp');
		expect(validateMcpAuth(request, undefined)).toBe(false);
	});

	it('rejects wrong token', () => {
		const request = new Request('http://localhost/mcp', {
			headers: { Authorization: 'Bearer wrong-key' }
		});
		expect(validateMcpAuth(request, undefined)).toBe(false);
	});

	it('rejects when MCP_API_KEY is not configured', () => {
		delete process.env.MCP_API_KEY;
		const request = new Request('http://localhost/mcp', {
			headers: { Authorization: 'Bearer test-mcp-key-12345' }
		});
		expect(validateMcpAuth(request, undefined)).toBe(false);
	});

	it('uses constant-time comparison (same-length wrong token)', () => {
		const request = new Request('http://localhost/mcp', {
			headers: { Authorization: 'Bearer test-mcp-key-12346' }
		});
		expect(validateMcpAuth(request, undefined)).toBe(false);
	});
});

describe('extractBearerToken', () => {
	it('returns token from Bearer header', () => {
		const request = new Request('http://localhost/mcp', {
			headers: { Authorization: 'Bearer abc123' }
		});
		expect(extractBearerToken(request)).toBe('abc123');
	});

	it('returns null when header missing', () => {
		expect(extractBearerToken(new Request('http://localhost/mcp'))).toBeNull();
	});
});

describe('mcpRateLimitKey', () => {
	it('hashes bearer token into stable key', async () => {
		const request = new Request('http://localhost/mcp', {
			headers: { Authorization: 'Bearer my-secret-token' }
		});
		const key = await mcpRateLimitKey(request, '127.0.0.1');
		expect(key.startsWith('mcp-key:')).toBe(true);
		expect(key).toBe(await mcpRateLimitKey(request, '127.0.0.1'));
	});

	it('falls back to IP when no token', async () => {
		const key = await mcpRateLimitKey(new Request('http://localhost/mcp'), '127.0.0.1');
		expect(key).toBe('mcp-ip:127.0.0.1');
	});
});

describe('mcpUnauthorizedResponse', () => {
	it('returns 401 JSON', async () => {
		const response = mcpUnauthorizedResponse();
		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ error: 'Unauthorized' });
	});
});
