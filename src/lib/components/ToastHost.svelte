<script lang="ts">
	import ToastRecord from '$lib/components/ToastRecord.svelte';
	import { toast, type ToastItem } from '$lib/stores/toast.svelte';
	import { cn } from '$lib/utils/cn';
	import { X } from 'phosphor-svelte';

	const kindStyles: Record<ToastItem['kind'], string> = {
		success:
			'border-emerald-400/70 bg-emerald-500/12 text-emerald-950 shadow-emerald-500/20 dark:border-emerald-400/50 dark:bg-emerald-500/10 dark:text-emerald-100 dark:shadow-emerald-900/40',
		error:
			'border-red-400/70 bg-red-500/12 text-red-950 shadow-red-500/20 dark:border-red-400/50 dark:bg-red-500/10 dark:text-red-100 dark:shadow-red-900/40',
		info: 'border-amber-400/70 bg-amber-400/14 text-stone-900 shadow-amber-500/20 dark:border-amber-400/50 dark:bg-amber-400/10 dark:text-amber-50 dark:shadow-amber-900/35'
	};

	const kindLabel: Record<ToastItem['kind'], string> = {
		success: 'Success',
		error: 'Error',
		info: 'Notice'
	};
</script>

<div
	class="pointer-events-none fixed right-4 z-[90] flex w-[min(100%,24rem)] flex-col gap-3 max-md:bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] bottom-4"
	aria-live="polite"
	aria-relevant="additions"
>
	{#each toast.items as item (item.id)}
		<div
			class={cn(
				'pointer-events-auto anim-rise relative overflow-hidden rounded-[2rem] border-2 shadow-lg backdrop-blur-md',
				kindStyles[item.kind]
			)}
			role="status"
		>
			<!-- Ghost disc — decorative spin behind the toast body -->
			<div
				class="pointer-events-none absolute -top-6 -left-6 opacity-30"
				aria-hidden="true"
			>
				<ToastRecord kind={item.kind} class="size-24" />
			</div>

			<div class="relative flex items-center gap-3 px-4 py-3.5 pl-3">
				<ToastRecord kind={item.kind} class="size-11 drop-shadow-sm" />
				<div class="min-w-0 flex-1">
					<p class="text-[10px] font-black tracking-widest uppercase opacity-70">
						{kindLabel[item.kind]}
					</p>
					<p class="text-sm leading-snug font-bold">{item.message}</p>
				</div>
				<button
					type="button"
					class="inline-flex size-8 shrink-0 items-center justify-center rounded-full opacity-70 transition-opacity hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
					aria-label="Dismiss notification"
					onclick={() => toast.dismiss(item.id)}
				>
					<X size={14} weight="bold" />
				</button>
			</div>
		</div>
	{/each}
</div>

<style>
	@media (prefers-reduced-motion: reduce) {
		:global(.record-spin) {
			animation: none;
		}
	}

	:global([data-motion='reduced']) :global(.record-spin) {
		animation: none;
	}
</style>
