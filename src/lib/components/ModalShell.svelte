<script lang="ts">
	import type { Snippet } from 'svelte';
	import { modal } from '$lib/utils/modal';
	import { X } from 'phosphor-svelte';

	interface Props {
		open: boolean;
		title: string;
		description?: string;
		size?: 'sm' | 'md' | 'lg';
		onClose: () => void;
		children: Snippet;
	}

	let { open, title, description, size = 'md', onClose, children }: Props = $props();

	const uid = $props.id();
</script>

<!-- Shared frame for form dialogs: backdrop, rounded panel, title row, close button.
     Escape, focus, scroll lock, and rendering above the nav dial come from modal(). -->
{#if open}
	<div
		class="modal-shell anim-fade"
		role="dialog"
		aria-modal="true"
		aria-labelledby="{uid}-title"
		{@attach modal({ onEscape: () => onClose() })}
	>
		<button
			type="button"
			class="modal-shell__backdrop"
			aria-label="Close dialog"
			tabindex="-1"
			onclick={onClose}
		></button>

		<div class="modal-shell__panel modal-shell__panel--{size} surface-round anim-rise">
			<div class="mb-5 flex items-start justify-between gap-3">
				<div class="min-w-0 flex-1">
					<h2
						id="{uid}-title"
						class="text-base font-black tracking-wide text-stone-900 uppercase dark:text-amber-50"
					>
						{title}
					</h2>
					{#if description}
						<p
							class="mt-1 text-sm leading-snug font-medium text-[rgb(var(--color-text-secondary))]"
						>
							{description}
						</p>
					{/if}
				</div>
				<button
					type="button"
					class="-mt-1 -mr-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] transition-colors hover:bg-black/5 hover:text-[rgb(var(--color-text))] dark:hover:bg-white/10"
					aria-label="Close dialog"
					onclick={onClose}
				>
					<X size={18} weight="bold" />
				</button>
			</div>

			{@render children()}
		</div>
	</div>
{/if}

<style>
	.modal-shell {
		position: fixed;
		inset: 0;
		z-index: 95;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal-shell__backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgb(0 0 0 / 0.58);
		backdrop-filter: blur(4px);
		cursor: pointer;
	}

	.modal-shell__panel {
		position: relative;
		z-index: 1;
		width: 100%;
		max-height: 90vh;
		max-height: 90dvh;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 1.5rem;
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.4);
	}

	.modal-shell__panel--sm {
		max-width: 28rem;
	}

	.modal-shell__panel--md {
		max-width: 32rem;
	}

	.modal-shell__panel--lg {
		max-width: 48rem;
	}

	@media (max-width: 480px) {
		.modal-shell__panel {
			padding: 1.25rem;
		}
	}
</style>
