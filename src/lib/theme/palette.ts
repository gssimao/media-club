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
	/** Page background. Light mode uses a soft off-white. */
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
	/** Champagne accent — button fills, rings, highlights. Not for small text on light bg. */
	accent: string;
	/** Accent hover state (darker in light mode, brighter in dark mode). */
	accentHover: string;
	/** Soft accent wash for hovers and tinted chips. */
	accentLight: string;
	/** Secondary brand blue (rarely used). */
	secondary: string;
	/** Secondary blue hover state. */
	secondaryHover: string;
	/** Destination accents, readable on the page and raised surfaces. */
	coral: string;
	lilac: string;
	mint: string;
	sky: string;
	/** Home page screen glow: burnt orange light spilling in from the page edges. */
	glowOrange: string;
	/** Home page screen glow: deep red. */
	glowRed: string;
	/** Home page screen glow: deep blue. */
	glowBlue: string;
	/** Home page screen glow: deep green. */
	glowGreen: string;
}

/** Light theme — soft white, ink, and champagne. */
export const light: ThemePalette = {
	bg: '#F6F5F2',
	surface: '#EEEDEA',
	surfaceRaised: '#FFFFFF',
	border: '#D9D8D4',
	text: '#202124',
	textSecondary: '#555860',
	textTertiary: '#6B6D73',
	accent: '#D0B488',
	accentHover: '#735B36',
	accentLight: '#EEE7DA',
	secondary: '#316A9B',
	secondaryHover: '#24547E',
	coral: '#9C4D41',
	lilac: '#73568F',
	mint: '#316F5E',
	sky: '#376C91',
	glowOrange: '#CA985D',
	glowRed: '#BB7776',
	glowBlue: '#7A83BC',
	glowGreen: '#6EA28E'
};

/** Dark theme — charcoal cinema with warm highlights. */
export const dark: ThemePalette = {
	bg: '#101114',
	surface: '#191B20',
	surfaceRaised: '#22252B',
	border: '#383B43',
	text: '#F4F3EF',
	textSecondary: '#C5C5C9',
	textTertiary: '#A4A5AD',
	accent: '#D8BE92',
	accentHover: '#E7CCA1',
	accentLight: '#353027',
	secondary: '#8BAED1',
	secondaryHover: '#A9C7E5',
	coral: '#E6A18D',
	lilac: '#B9A0D9',
	mint: '#8EC3AF',
	sky: '#90B9DD',
	glowOrange: '#CA985D',
	glowRed: '#BB7776',
	glowBlue: '#7A83BC',
	glowGreen: '#6EA28E'
};

/** Keep existing amber utility classes on the same restrained brand ramp. */
export const brandRamp = {
	50: '#FAF7F0',
	100: '#F3EBDD',
	200: '#E9D9BC',
	300: '#E2CAA3',
	400: '#D8BE92',
	500: '#C5A474',
	600: '#987647',
	700: '#735B36',
	800: '#58452C',
	900: '#3B3022',
	950: '#241E17'
};
