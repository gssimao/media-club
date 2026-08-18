/** Structured application error with a stable client-facing code. */
export class AppError extends Error {
	constructor(
		message: string,
		public readonly code: string = 'UNKNOWN',
		public readonly status: number = 500
	) {
		super(message);
		this.name = 'AppError';
	}
}
