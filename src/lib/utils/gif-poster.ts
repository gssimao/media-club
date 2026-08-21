function drawImageToDataUrl(img: HTMLImageElement): string | null {
	const canvas = document.createElement('canvas');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	const ctx = canvas.getContext('2d');
	if (!ctx || canvas.width === 0 || canvas.height === 0) return null;
	ctx.drawImage(img, 0, 0);
	return canvas.toDataURL('image/png');
}

function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		if (crossOrigin) img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('Image load failed'));
		img.src = src;
	});
}

/**
 * Captures the first frame of a GIF as a static PNG data URL for use as a poster.
 * Returns null when capture fails — callers may show the GIF directly (it may auto-play).
 */
export async function captureGifPoster(url: string): Promise<string | null> {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error('Fetch failed');
		const blob = await response.blob();
		const objectUrl = URL.createObjectURL(blob);
		try {
			const img = await loadImage(objectUrl);
			return drawImageToDataUrl(img);
		} finally {
			URL.revokeObjectURL(objectUrl);
		}
	} catch {
		// Fall through to crossOrigin image load.
	}

	try {
		const img = await loadImage(url, true);
		return drawImageToDataUrl(img);
	} catch {
		return null;
	}
}
