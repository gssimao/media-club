const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string): boolean {
	const now = Date.now();
	const current = buckets.get(key);

	if (!current || current.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
		return true;
	}

	if (current.count >= MAX_REQUESTS) {
		return false;
	}

	current.count += 1;
	return true;
}

export function clientIp(request: Request): string {
	return (
		request.headers.get('cf-connecting-ip') ??
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		'local'
	);
}
