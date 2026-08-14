/**
 * ── Media Club theme palette ─────────────────────────────────────────────
 *
 * THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR APP COLORS.
 *
 * To change the app's colors:
 *   1. Edit the hex values below (light and/or dark).
 *   2. Run `npm run theme` — this regenerates `src/routes/theme.css`.
 *   3. Refresh the app (the dev server hot-reloads the CSS automatically).
 *
 * The generator also checks WCAG contrast and warns you if a text color
 * will be hard to read against the backgrounds, so you can adjust before
 * shipping an unreadable theme.
 *
 * Never edit `src/routes/theme.css` by hand — it is overwritten on every run.
 */

export interface ThemePalette {
	/** Page background. Light mode uses warm parchment instead of pure white to reduce glare. */
	bg: string;
	/** Panels and wells that sit on the background (footer, notes, recent-item rows). */
	surface: string;
	/** Elevated cards, inputs, and discs — the brightest (light) / lightest (dark) surface. */
	surfaceRaised: string;
	/** Card and input borders. Must stay visible against both bg and surfaceRaised. */
	border: string;
	/** Primary text. Aim for at least 7:1 contrast against bg. */
	text: string;
	/** Labels and secondary copy. Aim for at least 4.5:1 against bg. */
	textSecondary: string;
	/** Placeholders and metadata. Keep at or above 4.5:1 against bg. */
	textTertiary: string;
	/** Brand amber — button fills, rings, highlights. Not for small text on light bg. */
	accent: string;
	/** Accent hover state (darker in light mode, brighter in dark mode). */
	accentHover: string;
	/** Soft accent wash for hovers and tinted chips. */
	accentLight: string;
	/** Secondary brand blue (rarely used). */
	secondary: string;
	/** Secondary blue hover state. */
	secondaryHover: string;
}

/** Light theme — warm parchment "daylight record shop". */
export const light: ThemePalette = {
	bg: '#F4EEE2',
	surface: '#FAF6ED',
	surfaceRaised: '#FFFDF6',
	border: '#D6C8AE',
	text: '#2B2318',
	textSecondary: '#5D4E3A',
	textTertiary: '#79684F',
	accent: '#FCB900',
	accentHover: '#DE9E00',
	accentLight: '#F8EBCB',
	secondary: '#00539B',
	secondaryHover: '#003C78'
};

/** Dark theme — warm late-night video store. */
export const dark: ThemePalette = {
	bg: '#1C1917',
	surface: '#262320',
	surfaceRaised: '#302D2A',
	border: '#443C32',
	text: '#FFFAF0',
	textSecondary: '#DCC8AA',
	textTertiary: '#B4A082',
	accent: '#FCB900',
	accentHover: '#FFC832',
	accentLight: '#504628',
	secondary: '#5096D2',
	secondaryHover: '#64AAE6'
};
