import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password hashing', () => {
	it('verifies a correct password', async () => {
		const stored = await hashPassword('correct horse battery staple');
		expect(await verifyPassword('correct horse battery staple', stored)).toBe(true);
	});

	it('rejects a wrong password', async () => {
		const stored = await hashPassword('correct horse battery staple');
		expect(await verifyPassword('Tr0ub4dor&3', stored)).toBe(false);
	});

	it('produces unique salts per hash', async () => {
		const first = await hashPassword('same-password');
		const second = await hashPassword('same-password');
		expect(first).not.toBe(second);
	});

	it('rejects malformed stored values', async () => {
		expect(await verifyPassword('anything', 'not-a-valid-hash')).toBe(false);
		expect(await verifyPassword('anything', '')).toBe(false);
	});

	it('never stores the plaintext password', async () => {
		const stored = await hashPassword('super-secret');
		expect(stored).not.toContain('super-secret');
	});
});
