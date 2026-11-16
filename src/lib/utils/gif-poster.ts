function drawImageToDataUrl(img: HTMLImageElement): string | null {
	const canvas = document.createElement('canvas');
	const scale = Math.min(1, 480 / Math.max(img.naturalWidth, img.naturalHeight));
	canvas.width = Math.round(img.naturalWidth * scale);
	canvas.height = Math.round(img.naturalHeight * scale);
	const ctx = canvas.getContext('2d');
	if (!ctx || canvas.width === 0 || canvas.height === 0) return null;
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	return canvas.toDataURL('image/png');
}

function loadCorsImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		// Needed so the canvas stays readable; hosts without CORS headers reject and we return null.
		img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('Image load failed'));
		img.src = src;
	});
}

/**
 * Captures the first frame of a GIF as a static PNG data URL for use as a poster.
 * Returns null when capture fails — callers may show the GIF directly (it may auto-play).
 *
 * Loads through an <img> only. The app's CSP (`connect-src 'self'`, no `blob:` images)
 * blocks fetching a remote GIF, so a fetch-based path could never succeed and only
 * logged a CSP violation for every GIF cover.
 */
async function capture(url: string): Promise<string | null> {
	try {
		const img = await loadCorsImage(url);
		return drawImageToDataUrl(img);
	} catch {
		return null;
	}
}

// Reuse stills between the shelf, library and detail view; bound their memory use.
const posters = new Map<string, Promise<string | null>>();
export function captureGifPoster(url: string): Promise<string | null> {
	const cached = posters.get(url);
	if (cached) return cached;
	if (posters.size >= 32) posters.delete(posters.keys().next().value!);
	const poster = capture(url);
	posters.set(url, poster);
	return poster;
}
