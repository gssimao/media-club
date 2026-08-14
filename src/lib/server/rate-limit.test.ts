import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkRateLimit, clientIp, LOGIN_RATE_LIMIT, resetRateLimits } from './rate-limit';

describe('checkRateLimit', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		resetRateLimits();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('allows requests under the default limit', () => {
		for (let i = 0; i < 30; i++) {
			expect(checkRateLimit('search:1.2.3.4')).toBe(true);
		}
	});

	it('blocks requests over the default limit', () => {
		for (let i = 0; i < 30; i++) checkRateLimit('search:1.2.3.4');
		expect(checkRateLimit('search:1.2.3.4')).toBe(false);
	});

	it('resets after the window elapses', () => {
		for (let i = 0; i < 30; i++) checkRateLimit('search:1.2.3.4');
		expect(checkRateLimit('search:1.2.3.4')).toBe(false);

		vi.advanceTimersByTime(61_000);
		expect(checkRateLimit('search:1.2.3.4')).toBe(true);
	});

	it('tracks keys independently', () => {
		for (let i = 0; i < 30; i++) checkRateLimit('search:1.2.3.4');
		expect(checkRateLimit('search:1.2.3.4')).toBe(false);
		expect(checkRateLimit('search:5.6.7.8')).toBe(true);
	});

	it('applies the stricter login budget', () => {
		for (let i = 0; i < 5; i++) {
			expect(checkRateLimit('login:1.2.3.4', LOGIN_RATE_LIMIT)).toBe(true);
		}
		expect(checkRateLimit('login:1.2.3.4', LOGIN_RATE_LIMIT)).toBe(false);

		// Still blocked after one minute; login window is five minutes.
		vi.advanceTimersByTime(60_000);
		expect(checkRateLimit('login:1.2.3.4', LOGIN_RATE_LIMIT)).toBe(false);

		vi.advanceTimersByTime(5 * 60_000);
		expect(checkRateLimit('login:1.2.3.4', LOGIN_RATE_LIMIT)).toBe(true);
	});
});

describe('clientIp', () => {
	it('prefers cf-connecting-ip', () => {
		const request = new Request('http://localhost/', {
			headers: { 'cf-connecting-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1' }
		});
		expect(clientIp(request)).toBe('9.9.9.9');
	});

	it('falls back to the first x-forwarded-for hop', () => {
		const request = new Request('http://localhost/', {
			headers: { 'x-forwarded-for': ' 2.2.2.2 , 3.3.3.3' }
		});
		expect(clientIp(request)).toBe('2.2.2.2');
	});

	it('defaults to local when no headers exist', () => {
		expect(clientIp(new Request('http://localhost/'))).toBe('local');
	});
});
