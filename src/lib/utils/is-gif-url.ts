/** True when the URL path ends with `.gif` (case-insensitive), ignoring query/hash. */
export function isGifUrl(url: string): boolean {
	if (!url) return false;

	try {
		const pathname = new URL(url, 'http://localhost').pathname;
		return /\.gif$/i.test(pathname);
	} catch {
		const path = url.split('?')[0]?.split('#')[0] ?? url;
		return /\.gif$/i.test(path);
	}
}
