import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@sveltejs/adapter-cloudflare';
import node from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';

const adapter = process.env.ADAPTER === 'node' ? node() : cloudflare();

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter,
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
	}
});
