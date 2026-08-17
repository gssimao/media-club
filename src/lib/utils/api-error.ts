/** Extract a human-readable message from a failed fetch/API response body. */
export function formatApiErrorMessage(text: string, fallback = 'Request failed'): string {
	const trimmed = text.trim();
	if (!trimmed) return fallback;

	try {
		const parsed = JSON.parse(trimmed) as { message?: string };
		if (parsed.message) return parsed.message;
	} catch {
		// Not JSON — use raw text.
	}

	return trimmed;
}
