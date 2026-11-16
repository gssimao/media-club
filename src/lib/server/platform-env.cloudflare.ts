import { env } from 'cloudflare:workers';

export function getPlatformEnv(): Env | undefined {
	return env;
}
