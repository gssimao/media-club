import type { AppDatabase } from '$lib/server/db';
import type { AdminUser } from '$lib/server/db/schema';

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
			user: AdminUser | null;
		}
	}
}

export {};
