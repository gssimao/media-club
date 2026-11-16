import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { drizzle } from 'drizzle-orm/d1';
import { getPlatformEnv } from '$platform-env';
import { getDb } from './db';
import { getDefaultRoute, getPlatformSecret } from './env';

vi.mock('$app/env', () => ({ dev: false, building: true }));
vi.mock('$platform-env', () => ({ getPlatformEnv: vi.fn() }));
vi.mock('drizzle-orm/d1', () => ({ drizzle: vi.fn(() => ({ kind: 'd1' })) }));

describe('Cloudflare bindings without event.platform', () => {
	const bindings = {
		DB: { prepare: vi.fn() },
		TMDB_API_KEY: 'cloudflare-test-key',
		DEFAULT_ROUTE: '/movies'
	} as unknown as Env;
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getPlatformEnv).mockReturnValue(bindings);
	});
	afterEach(() => vi.unstubAllEnvs());

	it('uses the D1 binding when the adapter provides no request platform', () => {
		expect(getDb(undefined)).toEqual({ kind: 'd1' });
		expect(drizzle).toHaveBeenCalledWith(bindings.DB, expect.any(Object));
	});
	it('reads TMDB credentials from Cloudflare bindings', () => {
		expect(getPlatformSecret(undefined, 'TMDB_API_KEY')).toBe('cloudflare-test-key');
	});
	it('preserves the Cloudflare default route setting', () => {
		expect(getDefaultRoute()).toBe('/movies');
	});
	it('keeps the Node environment fallback', () => {
		vi.mocked(getPlatformEnv).mockReturnValue(undefined);
		vi.stubEnv('TMDB_API_KEY', 'node-test-key');
		expect(getPlatformSecret(undefined, 'TMDB_API_KEY')).toBe('node-test-key');
	});
});
