<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { WarningCircle, X } from 'phosphor-svelte';

	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'danger' | 'default';
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		open,
		title,
		message,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		variant = 'default',
		onConfirm,
		onCancel
	}: Props = $props();

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onCancel();
	}
</script>

<svelte:window onkeydown={open ? onKeydown : undefined} />

{#if open}
	<div
		class="confirm-dialog anim-fade"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-dialog-title"
	>
		<button
			type="button"
			class="confirm-dialog__backdrop"
			aria-label="Cancel"
			onclick={onCancel}
		></button>

		<div
			class={cn(
				'confirm-dialog__panel surface-round anim-rise',
				variant === 'danger' && 'confirm-dialog__panel--danger'
			)}
		>
			<div class="flex items-start gap-3">
				{#if variant === 'danger'}
					<span
						class="inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-red-400/70 bg-red-500/10 text-red-600 dark:border-red-500/50 dark:text-red-400"
						aria-hidden="true"
					>
						<WarningCircle size={22} weight="bold" />
					</span>
				{/if}
				<div class="min-w-0 flex-1">
					<h2
						id="confirm-dialog-title"
						class="text-sm font-black tracking-wide text-stone-900 uppercase dark:text-amber-50"
					>
						{title}
					</h2>
					<p class="mt-2 text-sm leading-snug font-medium text-[rgb(var(--color-text-secondary))]">
						{message}
					</p>
				</div>
				<button
					type="button"
					class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] transition-colors hover:bg-black/5 hover:text-[rgb(var(--color-text))] dark:hover:bg-white/10"
					aria-label="Close dialog"
					onclick={onCancel}
				>
					<X size={16} weight="bold" />
				</button>
			</div>

			<div class="mt-5 flex flex-wrap justify-end gap-2">
				<button type="button" class="btn-secondary px-5 py-2 text-xs" onclick={onCancel}>
					{cancelLabel}
				</button>
				<button
					type="button"
					class={cn(
						'rounded-full border-2 px-5 py-2 text-xs font-black tracking-wide uppercase transition-colors',
						variant === 'danger'
							? 'border-red-500 bg-red-500 text-white hover:bg-red-600 dark:border-red-400 dark:bg-red-500/90 dark:hover:bg-red-400'
							: 'btn-primary'
					)}
					onclick={onConfirm}
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.confirm-dialog {
		position: fixed;
		inset: 0;
		z-index: 95;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
	}

	.confirm-dialog__backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgb(0 0 0 / 0.58);
		backdrop-filter: blur(4px);
		cursor: pointer;
	}

	.confirm-dialog__panel {
		position: relative;
		z-index: 1;
		width: min(100%, 22rem);
		padding: 1.25rem;
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.4);
	}

	.confirm-dialog__panel--danger {
		border-color: rgb(239 68 68 / 0.45);
	}
</style>
