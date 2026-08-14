/** Client-safe view of the admin user. Never include credential fields here. */
export interface SessionUser {
	id: string;
	username: string;
}
