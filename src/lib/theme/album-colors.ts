/** Preset accent colors for album sleeves — whitelisted slugs only. */
export const ALBUM_ACCENT_COLORS = [
	'amber',
	'rose',
	'sky',
	'emerald',
	'violet',
	'orange',
	'fuchsia',
	'stone'
] as const;

export type AlbumAccentColor = (typeof ALBUM_ACCENT_COLORS)[number];

export interface AlbumColorPreset {
	label: string;
	border: string;
	background: string;
	swatch: string;
}

export const ALBUM_COLOR_PRESETS: Record<AlbumAccentColor, AlbumColorPreset> = {
	amber: {
		label: 'Amber',
		border: 'border-amber-500/50 dark:border-amber-500/40',
		background: 'bg-amber-50/80 dark:bg-amber-950/30',
		swatch: 'bg-amber-400'
	},
	rose: {
		label: 'Rose',
		border: 'border-rose-400/60 dark:border-rose-500/40',
		background: 'bg-rose-50/80 dark:bg-rose-950/30',
		swatch: 'bg-rose-400'
	},
	sky: {
		label: 'Sky',
		border: 'border-sky-400/60 dark:border-sky-500/40',
		background: 'bg-sky-50/80 dark:bg-sky-950/30',
		swatch: 'bg-sky-400'
	},
	emerald: {
		label: 'Emerald',
		border: 'border-emerald-400/60 dark:border-emerald-500/40',
		background: 'bg-emerald-50/80 dark:bg-emerald-950/30',
		swatch: 'bg-emerald-400'
	},
	violet: {
		label: 'Violet',
		border: 'border-violet-400/60 dark:border-violet-500/40',
		background: 'bg-violet-50/80 dark:bg-violet-950/30',
		swatch: 'bg-violet-400'
	},
	orange: {
		label: 'Orange',
		border: 'border-orange-400/60 dark:border-orange-500/40',
		background: 'bg-orange-50/80 dark:bg-orange-950/30',
		swatch: 'bg-orange-400'
	},
	fuchsia: {
		label: 'Fuchsia',
		border: 'border-fuchsia-400/60 dark:border-fuchsia-500/40',
		background: 'bg-fuchsia-50/80 dark:bg-fuchsia-950/30',
		swatch: 'bg-fuchsia-400'
	},
	stone: {
		label: 'Stone',
		border: 'border-stone-400/60 dark:border-stone-500/40',
		background: 'bg-stone-100/80 dark:bg-stone-900/50',
		swatch: 'bg-stone-400'
	}
};

export const DEFAULT_ALBUM_COLOR: AlbumColorPreset = ALBUM_COLOR_PRESETS.amber;

export function isAlbumAccentColor(value: string): value is AlbumAccentColor {
	return (ALBUM_ACCENT_COLORS as readonly string[]).includes(value);
}

export function getAlbumColorPreset(accentColor: AlbumAccentColor | null | undefined): AlbumColorPreset {
	if (accentColor && accentColor in ALBUM_COLOR_PRESETS) {
		return ALBUM_COLOR_PRESETS[accentColor];
	}
	return DEFAULT_ALBUM_COLOR;
}
