export interface DragScrollOptions {
	/** Pixels moved before treating the gesture as a drag instead of a click. */
	threshold?: number;
}

/**
 * Click-and-drag horizontal scroll for an overflow container, for mouse users.
 * Attach it to the scroller itself. Touch and trackpad keep the browser's native
 * scrolling; a drag that started on a link or button does not trigger its click.
 */
export function dragScroll(node: HTMLElement, options: DragScrollOptions = {}) {
	const threshold = options.threshold ?? 5;

	let isDown = false;
	let isDragging = false;
	let suppressClick = false;
	let startX = 0;
	let startScrollLeft = 0;

	function canScroll() {
		return node.scrollWidth > node.clientWidth + 1;
	}

	function endDrag() {
		if (isDragging) {
			node.classList.remove('cursor-grabbing');
			node.style.removeProperty('user-select');
			// Restoring snap lets the shelf settle on the nearest tile.
			node.style.removeProperty('scroll-snap-type');
			// The click that ends a drag fires right after mouseup. If the pointer was released
			// outside the scroller there is no click, so clear the flag for the next real one.
			setTimeout(() => (suppressClick = false), 0);
		}
		isDown = false;
		isDragging = false;
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', endDrag);
	}

	function onMouseMove(event: MouseEvent) {
		if (!isDown) return;

		const dx = event.pageX - startX;
		if (!isDragging && Math.abs(dx) > threshold) {
			isDragging = true;
			suppressClick = true;
			node.classList.add('cursor-grabbing');
			node.style.userSelect = 'none';
			// Snap points fight scrollLeft updates while the pointer is moving.
			node.style.scrollSnapType = 'none';
		}

		if (isDragging) {
			event.preventDefault();
			node.scrollLeft = startScrollLeft - dx;
		}
	}

	function onMouseDown(event: MouseEvent) {
		if (event.button !== 0 || !canScroll()) return;

		isDown = true;
		isDragging = false;
		suppressClick = false;
		startX = event.pageX;
		startScrollLeft = node.scrollLeft;

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', endDrag);
	}

	/** Links and images inside the scroller would otherwise start a native drag-and-drop. */
	function onDragStart(event: DragEvent) {
		event.preventDefault();
	}

	function onClickCapture(event: MouseEvent) {
		if (!suppressClick) return;
		event.preventDefault();
		event.stopImmediatePropagation();
		suppressClick = false;
	}

	node.addEventListener('mousedown', onMouseDown);
	node.addEventListener('dragstart', onDragStart);
	node.addEventListener('click', onClickCapture, true);

	return {
		destroy() {
			endDrag();
			node.removeEventListener('mousedown', onMouseDown);
			node.removeEventListener('dragstart', onDragStart);
			node.removeEventListener('click', onClickCapture, true);
		}
	};
}
