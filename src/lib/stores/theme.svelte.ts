import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

class ThemeStore {
	private _theme = $state<Theme>('dark');

	constructor() {
		if (browser) {
			// The inline script in app.html already resolved the theme before first
			// paint — trust the attribute it set so store and DOM never disagree.
			const applied = document.documentElement.getAttribute('data-theme');
			if (applied === 'light' || applied === 'dark') {
				this._theme = applied;
			} else {
				const stored = localStorage.getItem('theme') as Theme | null;
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				this._theme = stored || (prefersDark ? 'dark' : 'light');
			}
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
