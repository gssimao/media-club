import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const databaseId = process.env.CLOUDFLARE_DATABASE_ID?.trim();
const customDomain = process.env.CLOUDFLARE_CUSTOM_DOMAIN?.trim() ?? 'mediaclub.gssimao.com';
const zoneName = process.env.CLOUDFLARE_ZONE_NAME?.trim() ?? 'gssimao.com';

if (!databaseId) {
	console.error(
		'CLOUDFLARE_DATABASE_ID is not set. Add it to .env locally or as a build secret in Cloudflare Workers Builds.'
	);
	process.exit(1);
}

const configPath = new URL('../wrangler.jsonc', import.meta.url);
let config = readFileSync(configPath, 'utf8');

config = config.replace(/"database_id"\s*:\s*"[^"]+"/, `"database_id": "${databaseId}"`);
config = config.replace(/"workers_dev"\s*:\s*(true|false)/, '"workers_dev": false');
config = config.replace(/"preview_urls"\s*:\s*(true|false)/, '"preview_urls": false');

if (!/"routes"\s*:/.test(config)) {
	config = config.replace(
		/"assets"\s*:\s*\{[\s\S]*?\},/,
		`$&
	"routes": [
		{
			"pattern": "${customDomain}",
			"zone_name": "${zoneName}",
			"custom_domain": true
		}
	],`
	);
}

const tempPath = '.wrangler.deploy.jsonc';
writeFileSync(tempPath, config);

const result = spawnSync('npx', ['wrangler', 'deploy', '--config', tempPath, '--keep-vars'], {
	stdio: 'inherit',
	shell: true,
	env: { ...process.env, CI: 'true', WRANGLER_CI: '1' }
});

process.exit(result.status ?? 1);
