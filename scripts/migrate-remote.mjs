import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const databaseId = process.env.CLOUDFLARE_DATABASE_ID?.trim();

if (!databaseId) {
	console.error(
		'CLOUDFLARE_DATABASE_ID is not set. Add it to .env (same value used by npm run deploy).'
	);
	process.exit(1);
}

const configPath = new URL('../wrangler.jsonc', import.meta.url);
let config = readFileSync(configPath, 'utf8');
config = config.replace(/"database_id"\s*:\s*"[^"]+"/, `"database_id": "${databaseId}"`);

const tempPath = '.wrangler.migrate.jsonc';
writeFileSync(tempPath, config);

const result = spawnSync(
	'npx',
	['wrangler', 'd1', 'migrations', 'apply', 'media-club-db', '--remote', '--config', tempPath],
	{
		stdio: 'inherit',
		shell: true,
		env: { ...process.env, CI: 'true', WRANGLER_CI: '1' }
	}
);

try {
	unlinkSync(tempPath);
} catch {
	// temp config may already be gone
}

process.exit(result.status ?? 1);
