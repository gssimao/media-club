import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@sveltejs/adapter-cloudflare';
import node from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';

const useNode = process.env.ADAPTER === 'node' || Boolean(process.env.VITEST);
const adapter = useNode ? node() : cloudflare();

export default defineConfig({
	server: {
		port: 5173,
		strictPort: false
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			// Keep the existing import paths while adopting the patched SvelteKit runtime.
			alias: {
				$lib: './src/lib',
				'$platform-env': useNode
					? './src/lib/server/platform-env.node.ts'
					: './src/lib/server/platform-env.cloudflare.ts'
			},
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
		// Bundle Kit's cookie version instead of resolving the MCP SDK's older copy at runtime.
		noExternal: ['phosphor-svelte', 'cookie']
	}
});
