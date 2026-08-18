import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const databaseId = process.env.CLOUDFLARE_DATABASE_ID?.trim();

if (!databaseId) {
	console.error(
		'CLOUDFLARE_DATABASE_ID is not set. Add it as a build secret in Cloudflare Workers Builds.'
	);
	process.exit(1);
}

const configPath = new URL('../wrangler.jsonc', import.meta.url);
let config = readFileSync(configPath, 'utf8');

config = config.replace(/"database_id"\s*:\s*"[^"]+"/, `"database_id": "${databaseId}"`);
config = config.replace(/"workers_dev"\s*:\s*(true|false)/, '"workers_dev": false');

const tempPath = '.wrangler.deploy.jsonc';
writeFileSync(tempPath, config);

const result = spawnSync('npx', ['wrangler', 'deploy', '--config', tempPath], {
	stdio: 'inherit',
	shell: true
});

process.exit(result.status ?? 1);
