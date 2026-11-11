<script lang="ts" module>
	import type { Component } from 'svelte';

	export interface CardMenuAction<T extends string = string> {
		id: T;
		label: string;
		icon: Component<{ size?: number | string; weight?: 'bold' }>;
		/** `accent` for the main positive action, `danger` for destructive ones. */
		tone?: 'default' | 'accent' | 'danger';
	}
</script>

<script lang="ts" generics="T extends string">
	import { modal } from '$lib/utils/modal';
	import { DotsThree } from 'phosphor-svelte';

	interface Props {
		/** Unique id for the menu element (used by aria-controls). */
		menuId: string;
		/** Accessible name of the trigger, e.g. "Item options for Alien". */
		triggerLabel: string;
		/** Name of the thing the menu acts on, e.g. the item title. */
		subject: string;
		actions: CardMenuAction<T>[];
		/** Whether the menu is showing. */
		open?: boolean;
		onSelect: (id: T) => void;
	}

	let {
		menuId,
		triggerLabel,
		subject,
		actions,
		open = $bindable(false),
		onSelect
	}: Props = $props();

	let rootEl = $state<HTMLDivElement | undefined>();
	let triggerEl = $state<HTMLButtonElement | undefined>();

	// Tapping anywhere outside the menu dismisses it.
	$effect(() => {
		if (!open) return;

		function onPointerDown(event: PointerEvent) {
			if (rootEl && event.target instanceof Node && !rootEl.contains(event.target)) {
				open = false;
			}
		}

		document.addEventListener('pointerdown', onPointerDown, true);
		return () => document.removeEventListener('pointerdown', onPointerDown, true);
	});

	/** On narrow screens a left-column card would push the menu past the screen edge. */
	function keepOnScreen(node: HTMLElement) {
		const EDGE_PAD = 12;
		const overflow = EDGE_PAD - node.getBoundingClientRect().left;
		if (overflow > 0) node.style.right = `${-overflow}px`;
	}

	function choose(id: T) {
		// Hand focus back to the options button first: the dialog the action opens returns
		// focus there when it closes, instead of dropping it on the page body.
		triggerEl?.focus({ preventScroll: true });
		open = false;
		onSelect(id);
	}
</script>

<div bind:this={rootEl} class="relative flex items-center gap-1">
	<button
		bind:this={triggerEl}
		type="button"
		class="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-text-secondary))] shadow-sm transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400 {open
			? 'border-amber-500 text-amber-700 dark:text-amber-400'
			: ''}"
		aria-label={triggerLabel}
		aria-haspopup="menu"
		aria-expanded={open}
		aria-controls={menuId}
		onclick={() => (open = !open)}
	>
		<DotsThree size={16} weight="bold" />
	</button>

	<!-- The menu opens right under the button that summoned it, like a context menu,
	     instead of adding buttons at the far end of the card. -->
	{#if open}
		<!-- Catches the dismissing tap so it does not also activate whatever is underneath
		     (same pattern as MediaFilterPopover). -->
		<button
			type="button"
			class="fixed inset-0 z-10 cursor-default border-0 bg-transparent p-0"
			aria-label="Close options for {subject}"
			tabindex="-1"
			onclick={() => (open = false)}
		></button>
	{/if}

	{#if open}
		<div
			id={menuId}
			class="media-option-popover card-menu anim-rise absolute top-full right-0 z-30 mt-1.5"
			role="menu"
			aria-label="Options for {subject}"
			{@attach keepOnScreen}
			{@attach modal({
				onEscape: () => (open = false),
				portal: false,
				lockScroll: false,
				trapFocus: false
			})}
		>
			{#each actions as action (action.id)}
				{@const Icon = action.icon}
				<button
					type="button"
					role="menuitem"
					class="card-menu__item"
					class:card-menu__item--accent={action.tone === 'accent'}
					class:card-menu__item--danger={action.tone === 'danger'}
					onclick={() => choose(action.id)}
				>
					<Icon size={14} weight="bold" />
					{action.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.card-menu {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		width: max-content;
		min-width: 11rem;
		max-width: calc(100vw - 2rem);
		--rise-delay: 0ms;
		animation-duration: 0.2s;
	}

	.card-menu__item {
		display: flex;
		width: 100%;
		min-height: 2.25rem;
		align-items: center;
		gap: 0.5rem;
		border-radius: 9999px;
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 700;
		line-height: 1;
		text-align: left;
		white-space: nowrap;
		color: rgb(var(--color-text));
		cursor: pointer;
	}

	/* Long labels must not squeeze the icon. */
	.card-menu__item :global(svg) {
		flex-shrink: 0;
	}

	.card-menu__item:hover {
		background: rgb(var(--color-accent-light) / 0.7);
	}

	.card-menu__item--accent {
		color: rgb(180 83 9);
	}

	:global([data-theme='dark']) .card-menu__item--accent {
		color: rgb(251 191 36);
	}

	.card-menu__item--danger {
		color: rgb(185 28 28);
	}

	:global([data-theme='dark']) .card-menu__item--danger {
		color: rgb(248 113 113);
	}

	.card-menu__item--danger:hover {
		background: rgb(239 68 68 / 0.12);
	}
</style>
