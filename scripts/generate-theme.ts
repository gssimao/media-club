#!/usr/bin/env node
/**
 * Generates `src/routes/theme.css` from `src/lib/theme/palette.ts`.
 *
 * Usage: npm run theme
 *
 * Edit colors in the palette file, never in the generated CSS.
 * The script converts hex colors to the space-separated RGB triples the app's
 * CSS expects (so Tailwind opacity modifiers like `rgb(var(--color-border)/0.9)`
 * keep working), and prints WCAG contrast warnings for risky text/background pairs.
 */
import { writeFileSync } from 'node:fs';
import { dark, light, type ThemePalette } from '../src/lib/theme/palette.ts';

const OUTPUT_PATH = 'src/routes/theme.css';

/** Palette key → CSS custom property (matches usage throughout the app). */
const CSS_VARS: Record<keyof ThemePalette, string> = {
	bg: '--color-bg',
	surface: '--color-surface',
	surfaceRaised: '--color-surface-raised',
	border: '--color-border',
	text: '--color-text',
	textSecondary: '--color-text-secondary',
	textTertiary: '--color-text-tertiary',
	accent: '--color-accent',
	accentHover: '--color-accent-hover',
	accentLight: '--color-accent-light',
	secondary: '--color-secondary',
	secondaryHover: '--color-secondary-hover'
};

function hexToRgb(hex: string): [number, number, number] {
	const normalized = hex.replace('#', '');
	const expanded =
		normalized.length === 3
			? normalized
					.split('')
					.map((c) => c + c)
					.join('')
			: normalized;

	if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
		throw new Error(`Invalid hex color: "${hex}" — use #RGB or #RRGGBB.`);
	}

	return [
		parseInt(expanded.slice(0, 2), 16),
		parseInt(expanded.slice(2, 4), 16),
		parseInt(expanded.slice(4, 6), 16)
	];
}

/** WCAG 2.x relative luminance. */
function luminance([r, g, b]: [number, number, number]): number {
	const [lr, lg, lb] = [r, g, b].map((channel) => {
		const c = channel / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(a: string, b: string): number {
	const la = luminance(hexToRgb(a));
	const lb = luminance(hexToRgb(b));
	const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
	return (lighter + 0.05) / (darker + 0.05);
}

function checkContrast(themeName: string, palette: ThemePalette): string[] {
	// Text colors are checked against every surface they can appear on.
	const pairs: Array<{ fg: keyof ThemePalette; bg: keyof ThemePalette; min: number }> = [
		{ fg: 'text', bg: 'bg', min: 7 },
		{ fg: 'text', bg: 'surface', min: 7 },
		{ fg: 'text', bg: 'surfaceRaised', min: 7 },
		{ fg: 'textSecondary', bg: 'bg', min: 4.5 },
		{ fg: 'textSecondary', bg: 'surface', min: 4.5 },
		{ fg: 'textSecondary', bg: 'surfaceRaised', min: 4.5 },
		{ fg: 'textTertiary', bg: 'bg', min: 4.5 },
		{ fg: 'textTertiary', bg: 'surfaceRaised', min: 4.5 }
	];

	const warnings: string[] = [];
	for (const { fg, bg, min } of pairs) {
		const ratio = contrastRatio(palette[fg], palette[bg]);
		if (ratio < min) {
			warnings.push(
				`  [${themeName}] ${fg} (${palette[fg]}) on ${bg} (${palette[bg]}) is ` +
					`${ratio.toFixed(2)}:1 — aim for at least ${min}:1 or text will be hard to read.`
			);
		}
	}
	return warnings;
}

function themeBlock(
	selector: string,
	colorScheme: 'light' | 'dark',
	palette: ThemePalette
): string {
	const vars = (Object.keys(CSS_VARS) as Array<keyof ThemePalette>)
		.map((key) => {
			const [r, g, b] = hexToRgb(palette[key]);
			return `\t${CSS_VARS[key]}: ${r} ${g} ${b}; /* ${palette[key]} */`;
		})
		.join('\n');

	return `${selector} {\n\tcolor-scheme: ${colorScheme};\n\n${vars}\n}`;
}

const css = `/*
 * GENERATED FILE — DO NOT EDIT.
 *
 * Change colors in src/lib/theme/palette.ts, then run: npm run theme
 *
 * Values are space-separated RGB triples so components can apply opacity,
 * e.g. rgb(var(--color-accent) / 0.5).
 */

${themeBlock(':root', 'light', light)}

${themeBlock("[data-theme='dark']", 'dark', dark)}
`;

writeFileSync(OUTPUT_PATH, css);
console.log(`Wrote ${OUTPUT_PATH}`);

const warnings = [...checkContrast('light', light), ...checkContrast('dark', dark)];
if (warnings.length > 0) {
	console.warn('\nContrast warnings (theme still generated):');
	for (const warning of warnings) console.warn(warning);
	process.exitCode = 1;
} else {
	console.log('All text/background pairs pass WCAG contrast checks.');
}
