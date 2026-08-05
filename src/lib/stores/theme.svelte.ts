import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

class ThemeStore {
	private _theme = $state<Theme>('dark');

	constructor() {
		if (browser) {
			const stored = localStorage.getItem('theme') as Theme | null;
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			this._theme = stored || (prefersDark ? 'dark' : 'light');
			this.apply();
		}
	}

	get current(): Theme {
		return this._theme;
	}

	toggle() {
		this._theme = this._theme === 'dark' ? 'light' : 'dark';
		this.apply();
	}

	private apply() {
		if (browser) {
			document.documentElement.setAttribute('data-theme', this._theme);
			localStorage.setItem('theme', this._theme);
		}
	}
}

export const theme = new ThemeStore();
