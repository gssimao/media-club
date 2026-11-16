import type { Attachment } from 'svelte/attachments';

interface CoverRevealHandlers {
	setHover: (hovering: boolean) => void;
	togglePin: () => void;
	setKeyboard: (active: boolean) => void;
}

/**
 * Shows cover tools on mouse hover, and pins them on tap for touch screens.
 * Keyboard focus inside the cover counts too, so the buttons can be reached by tabbing.
 */
export function bindCoverReveal(handlers: CoverRevealHandlers): Attachment<HTMLElement> {
	return (node) => {
		let attached = true;
		const onEnter = (event: PointerEvent) => {
			if (event.pointerType === 'mouse') handlers.setHover(true);
		};
		const onLeave = (event: PointerEvent) => {
			if (event.pointerType === 'mouse') handlers.setHover(false);
		};
		const onClick = (event: MouseEvent) => {
			if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
			if (event.target instanceof Element && event.target.closest('.cover-tools')) return;
			handlers.togglePin();
		};
		// Moving a watched card between sections can blur it during Svelte's render.
		// Defer the state write until that render has finished, and ignore detached cards.
		const syncFocus = () =>
			queueMicrotask(() => {
				if (attached) handlers.setKeyboard(node.contains(document.activeElement));
			});

		node.addEventListener('pointerenter', onEnter);
		node.addEventListener('pointerleave', onLeave);
		node.addEventListener('click', onClick);
		node.addEventListener('focusin', syncFocus);
		node.addEventListener('focusout', syncFocus);

		return () => {
			attached = false;
			node.removeEventListener('pointerenter', onEnter);
			node.removeEventListener('pointerleave', onLeave);
			node.removeEventListener('click', onClick);
			node.removeEventListener('focusin', syncFocus);
			node.removeEventListener('focusout', syncFocus);
		};
	};
}
