import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@sveltejs/adapter-cloudflare';
import node from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';

const adapter = process.env.ADAPTER === 'node' ? node() : cloudflare();

export default defineConfig({
	server: {
		port: 5173,
		strictPort: false
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter,
			csp: {
				directives: {
					'default-src': ['self'],
					// Covers are hot-linked from TMDB/Discogs/Open Library CDNs.
					'img-src': ['self', 'https:', 'data:'],
					// Svelte transitions and style: directives require inline styles.
					'style-src': ['self', 'unsafe-inline'],
					'script-src': ['self'],
					'connect-src': ['self'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'frame-ancestors': ['none']
				}
			},
			typescript: {
				config: (config) => {
					config.include.push('../drizzle.config.ts');
				}
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	},
	ssr: {
		noExternal: ['phosphor-svelte']
	}
});
