import type { AppDatabase } from '$lib/server/db';
import type { SessionUser } from '$lib/types/auth';

declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		interface Locals {
			db: AppDatabase;
			user: SessionUser | null;
		}
	}
}

export {};
