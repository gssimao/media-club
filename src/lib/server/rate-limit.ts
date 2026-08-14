interface RateLimitOptions {
	/** Maximum requests allowed within the window. */
	max: number;
	/** Window length in milliseconds. */
	windowMs: number;
}

const DEFAULT_OPTIONS: RateLimitOptions = { max: 30, windowMs: 60_000 };

/** Login gets a much tighter budget than search to slow down brute-force attempts. */
export const LOGIN_RATE_LIMIT: RateLimitOptions = { max: 5, windowMs: 5 * 60_000 };

const buckets = new Map<string, { count: number; resetAt: number }>();

/** Prevent unbounded memory growth on long-lived Node deployments. */
const PRUNE_THRESHOLD = 10_000;

function pruneExpired(now: number) {
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key);
	}
}

/**
 * Fixed-window in-memory rate limiter. State is per-process (per-isolate on
 * Cloudflare Workers), which is acceptable for a single-admin, self-hosted app.
 */
export function checkRateLimit(key: string, options: RateLimitOptions = DEFAULT_OPTIONS): boolean {
	const now = Date.now();
	if (buckets.size >= PRUNE_THRESHOLD) pruneExpired(now);

	const current = buckets.get(key);

	if (!current || current.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + options.windowMs });
		return true;
	}

	if (current.count >= options.max) {
		return false;
	}

	current.count += 1;
	return true;
}

/** Test-only helper to reset limiter state between cases. */
export function resetRateLimits() {
	buckets.clear();
}

export function clientIp(request: Request): string {
	return (
		request.headers.get('cf-connecting-ip') ??
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		'local'
	);
}
