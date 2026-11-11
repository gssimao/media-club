import type { Attachment } from 'svelte/attachments';

export interface ModalOptions {
	/** Called when Escape is pressed while this is the topmost open overlay. */
	onEscape?: () => void;
	/**
	 * Move the element to `<body>` so no ancestor stacking context, transform, or
	 * overflow can trap it under the nav dial. Default true.
	 */
	portal?: boolean;
	/** Stop the page behind the overlay from scrolling. Default true. */
	lockScroll?: boolean;
	/** Keep Tab inside the overlay and hand focus back to the trigger on close. Default true. */
	trapFocus?: boolean;
}

interface OverlayEntry {
	node: HTMLElement;
	onEscape?: () => void;
	trapFocus: boolean;
}

const FOCUSABLE = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])'
].join(',');

/** Open overlays, oldest first. Only the last one reacts to the keyboard. */
const stack: OverlayEntry[] = [];

let scrollLocks = 0;
let savedOverflow = '';
let savedPaddingRight = '';

function lockScroll() {
	if (scrollLocks === 0) {
		const { body, documentElement } = document;
		// Pad by the scrollbar width so the page does not shift sideways when it disappears.
		const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
		savedOverflow = body.style.overflow;
		savedPaddingRight = body.style.paddingRight;
		body.style.overflow = 'hidden';
		if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
	}
	scrollLocks += 1;
}

function unlockScroll() {
	scrollLocks = Math.max(0, scrollLocks - 1);
	if (scrollLocks === 0) {
		document.body.style.overflow = savedOverflow;
		document.body.style.paddingRight = savedPaddingRight;
	}
}

function focusableWithin(node: HTMLElement): HTMLElement[] {
	return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
		(el) => el.getClientRects().length > 0
	);
}

function onKeydown(event: KeyboardEvent) {
	const top = stack.at(-1);
	if (!top || event.defaultPrevented) return;

	if (event.key === 'Escape') {
		if (!top.onEscape) return;
		event.preventDefault();
		top.onEscape();
		return;
	}

	if (event.key !== 'Tab' || !top.trapFocus) return;

	const focusable = focusableWithin(top.node);
	if (focusable.length === 0) {
		event.preventDefault();
		return;
	}

	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	const active = document.activeElement;
	const outside = !(active instanceof Node) || !top.node.contains(active) || active === top.node;

	if (event.shiftKey && (outside || active === first)) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && (outside || active === last)) {
		event.preventDefault();
		first.focus();
	}
}

/**
 * Shared behavior for dialogs, sheets, and popovers. Attach to the overlay root:
 *
 * ```svelte
 * <div class="my-dialog" {@attach modal({ onEscape: () => onClose() })}>
 * ```
 *
 * The root must be the only top-level element of its `{#if}` block, because it is
 * moved to `<body>` while open. Pass callbacks as arrow functions so the attachment
 * does not re-run (and re-mount the overlay) when a parent prop changes.
 */
export function modal(options: ModalOptions = {}): Attachment<HTMLElement> {
	const { onEscape, portal = true, lockScroll: shouldLock = true, trapFocus = true } = options;

	return (node) => {
		const previouslyFocused =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const entry: OverlayEntry = { node, onEscape, trapFocus };

		if (portal) document.body.appendChild(node);
		if (shouldLock) lockScroll();
		if (stack.length === 0) window.addEventListener('keydown', onKeydown);
		stack.push(entry);

		let focusFrame = 0;
		if (trapFocus) {
			// Wait a frame so fields that focus themselves (e.g. SearchBar autofocus) win.
			focusFrame = requestAnimationFrame(() => {
				if (node.contains(document.activeElement)) return;
				// The browser (and Svelte) only honor `autofocus` when nothing else has focus, and
				// the button that opened the overlay usually still does.
				const preferred = node.querySelector<HTMLElement>('[autofocus]');
				if (preferred && preferred.getClientRects().length > 0) {
					preferred.focus({ preventScroll: true });
					return;
				}
				if (!node.hasAttribute('tabindex')) node.tabIndex = -1;
				node.style.outline = 'none';
				node.focus({ preventScroll: true });
			});
		}

		return () => {
			cancelAnimationFrame(focusFrame);
			const index = stack.indexOf(entry);
			if (index !== -1) stack.splice(index, 1);
			if (stack.length === 0) window.removeEventListener('keydown', onKeydown);
			if (shouldLock) unlockScroll();
			if (portal) node.remove();

			if (trapFocus && previouslyFocused?.isConnected) {
				const active = document.activeElement;
				const focusWasInside =
					!active || active === document.body || (active instanceof Node && node.contains(active));
				if (focusWasInside) previouslyFocused.focus({ preventScroll: true });
			}
		};
	};
}
