import { browser } from '$app/environment';

export type MotionPref = 'full' | 'reduced';
export type DensityPref = 'cozy' | 'compact';
export type DiscRpm = 33 | 45 | 78;

const STORAGE_KEY = 'media-club-settings';

/** Milliseconds per full rotation of the home disc, per "RPM" stop. */
const SPIN_PERIOD_BY_RPM: Record<DiscRpm, number> = {
	33: 24_000,
	45: 14_000,
	78: 7_000
};

const DEFAULTS = {
	motion: 'full' as MotionPref,
	density: 'cozy' as DensityPref,
	discRpm: 33 as DiscRpm
};

function isMotionPref(value: unknown): value is MotionPref {
	return value === 'full' || value === 'reduced';
}

function isDensityPref(value: unknown): value is DensityPref {
	return value === 'cozy' || value === 'compact';
}

function isDiscRpm(value: unknown): value is DiscRpm {
	return value === 33 || value === 45 || value === 78;
}

class SettingsStore {
	private _motion = $state<MotionPref>(DEFAULTS.motion);
	private _density = $state<DensityPref>(DEFAULTS.density);
	private _discRpm = $state<DiscRpm>(DEFAULTS.discRpm);

	constructor() {
		if (browser) {
			try {
				const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
				if (stored && typeof stored === 'object') {
					const candidate = stored as Record<string, unknown>;
					if (isMotionPref(candidate.motion)) this._motion = candidate.motion;
					if (isDensityPref(candidate.density)) this._density = candidate.density;
					if (isDiscRpm(candidate.discRpm)) this._discRpm = candidate.discRpm;
				}
			} catch {
				// Corrupted storage — keep defaults.
			}
			this.apply();
		}
	}

	get motion(): MotionPref {
		return this._motion;
	}

	get density(): DensityPref {
		return this._density;
	}

	get discRpm(): DiscRpm {
		return this._discRpm;
	}

	get spinPeriodMs(): number {
		return SPIN_PERIOD_BY_RPM[this._discRpm];
	}

	setMotion(value: MotionPref) {
		this._motion = value;
		this.save();
	}

	setDensity(value: DensityPref) {
		this._density = value;
		this.save();
	}

	setDiscRpm(value: DiscRpm) {
		this._discRpm = value;
		this.save();
	}

	reset() {
		this._motion = DEFAULTS.motion;
		this._density = DEFAULTS.density;
		this._discRpm = DEFAULTS.discRpm;
		this.save();
	}

	private save() {
		if (!browser) return;
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ motion: this._motion, density: this._density, discRpm: this._discRpm })
		);
		this.apply();
	}

	private apply() {
		document.documentElement.setAttribute('data-motion', this._motion);
	}
}

export const settings = new SettingsStore();
