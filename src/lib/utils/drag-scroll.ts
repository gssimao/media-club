export interface DragScrollOptions {
	/** Pixels moved before treating the gesture as a drag instead of a click. */
	threshold?: number;
	/** Scroll container to move (defaults to the element the action is on). */
	scrollTarget?: HTMLElement;
}

/**
 * Click-and-drag horizontal scroll for overflow containers.
 * Attach to a handle bar and pass scrollTarget to scroll a sibling container without link conflicts.
 */
export function dragScroll(node: HTMLElement, options: DragScrollOptions = {}) {
	const threshold = options.threshold ?? 5;
	let scrollNode = options.scrollTarget ?? node;

	let isDown = false;
	let isDragging = false;
	let suppressClick = false;
	let startX = 0;
	let scrollLeft = 0;

	function endDrag() {
		isDown = false;
		isDragging = false;
		node.classList.remove('cursor-grabbing');
		node.classList.add('cursor-grab');
		node.style.removeProperty('user-select');
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);
		window.removeEventListener('touchmove', onTouchMove);
		window.removeEventListener('touchend', onTouchEnd);
		window.removeEventListener('touchcancel', onTouchEnd);
	}

	function applyScroll(pageX: number) {
		const dx = pageX - startX;
		if (!isDragging && Math.abs(dx) > threshold) {
			isDragging = true;
			suppressClick = true;
			node.style.userSelect = 'none';
		}

		if (isDragging) {
			scrollNode.scrollLeft = scrollLeft - dx;
		}
	}

	function onMouseMove(e: MouseEvent) {
		if (!isDown) return;

		if (isDragging) {
			e.preventDefault();
		}

		applyScroll(e.pageX);
	}

	function onTouchMove(e: TouchEvent) {
		if (!isDown || e.touches.length !== 1) return;

		if (isDragging) {
			e.preventDefault();
		}

		applyScroll(e.touches[0].pageX);
	}

	function onMouseUp() {
		endDrag();
	}

	function onTouchEnd() {
		endDrag();
	}

	function beginDrag(pageX: number) {
		isDown = true;
		isDragging = false;
		suppressClick = false;
		startX = pageX;
		scrollLeft = scrollNode.scrollLeft;

		node.classList.remove('cursor-grab');
		node.classList.add('cursor-grabbing');
	}

	function onMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;

		beginDrag(e.pageX);

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	function onTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1) return;

		beginDrag(e.touches[0].pageX);

		window.addEventListener('touchmove', onTouchMove, { passive: false });
		window.addEventListener('touchend', onTouchEnd);
		window.addEventListener('touchcancel', onTouchEnd);
	}

	function onClickCapture(e: MouseEvent) {
		if (!suppressClick) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		suppressClick = false;
	}

	node.classList.add('cursor-grab');
	node.addEventListener('mousedown', onMouseDown);
	node.addEventListener('touchstart', onTouchStart, { passive: true });
	node.addEventListener('click', onClickCapture, true);

	return {
		update(newOptions: DragScrollOptions = {}) {
			scrollNode = newOptions.scrollTarget ?? node;
		},
		destroy() {
			endDrag();
			node.removeEventListener('mousedown', onMouseDown);
			node.removeEventListener('touchstart', onTouchStart);
			node.removeEventListener('click', onClickCapture, true);
			node.classList.remove('cursor-grab', 'cursor-grabbing');
			node.style.removeProperty('user-select');
		}
	};
}
