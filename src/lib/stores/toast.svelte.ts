export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
	id: string;
	kind: ToastKind;
	message: string;
}

const DEFAULT_DURATION_MS = 4200;

class ToastStore {
	items = $state<ToastItem[]>([]);

	push(kind: ToastKind, message: string, durationMs = DEFAULT_DURATION_MS) {
		const id = crypto.randomUUID();
		this.items = [...this.items, { id, kind, message }];

		if (durationMs > 0) {
			setTimeout(() => this.dismiss(id), durationMs);
		}
	}

	success(message: string) {
		this.push('success', message);
	}

	error(message: string) {
		this.push('error', message);
	}

	info(message: string) {
		this.push('info', message);
	}

	/** Yellow warning-style toast — alias for info. */
	warning(message: string) {
		this.push('info', message);
	}

	dismiss(id: string) {
		this.items = this.items.filter((item) => item.id !== id);
	}
}

export const toast = new ToastStore();
