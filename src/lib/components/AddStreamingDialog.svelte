<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast.svelte';
	import { Plus, X } from 'phosphor-svelte';

	interface Props {
		listId: string;
		isOpen: boolean;
		onClose: () => void;
	}

	let { listId, isOpen, onClose }: Props = $props();

	let manualTitle = $state('');
	let manualSubtitle = $state('');
	let manualYear = $state('');
	let manualCoverUrl = $state('');

	$effect(() => {
		if (!isOpen) {
			manualTitle = '';
			manualSubtitle = '';
			manualYear = '';
			manualCoverUrl = '';
		}
	});

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="streaming-dialog-title"
		tabindex="-1"
	>
		<div
			class="surface-round relative max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="mb-6 flex items-start justify-between">
				<div>
					<h2
						id="streaming-dialog-title"
						class="text-2xl font-bold text-stone-900 dark:text-amber-50"
					>
						Manual entry
					</h2>
					<p class="mt-1 text-sm font-medium text-stone-600 dark:text-stone-400">
						Add a movie to this streaming list without searching TMDB
					</p>
				</div>
				<button
					onclick={onClose}
					class="rounded-full p-2 transition-colors hover:bg-stone-200 dark:hover:bg-stone-700"
					aria-label="Close dialog"
				>
					<X size={24} weight="bold" />
				</button>
			</div>

			<form
				method="POST"
				action="?/addItem"
				class="space-y-4"
				use:enhance={() => {
					return async ({ result: actionResult, update }) => {
						if (actionResult.type === 'failure') {
							toast.error(String(actionResult.data?.message ?? 'Could not add movie.'));
						} else {
							toast.success(`Added "${manualTitle}" to this streaming list.`);
							manualTitle = '';
							manualSubtitle = '';
							manualYear = '';
							manualCoverUrl = '';
							onClose();
						}
						await update();
					};
				}}
			>
				<input type="hidden" name="listId" value={listId} />
				<input type="hidden" name="externalId" value="manual-{Date.now()}" />

				<label class="block space-y-1 text-sm">
					<span class="font-bold text-stone-700 dark:text-stone-300">Title *</span>
					<input
						type="text"
						name="title"
						bind:value={manualTitle}
						required
						placeholder="Enter title"
						class="input-round w-full"
					/>
				</label>

				<label class="block space-y-1 text-sm">
					<span class="font-bold text-stone-700 dark:text-stone-300">Subtitle</span>
					<input
						type="text"
						name="subtitle"
						bind:value={manualSubtitle}
						placeholder="Optional subtitle"
						class="input-round w-full"
					/>
				</label>

				<label class="block space-y-1 text-sm">
					<span class="font-bold text-stone-700 dark:text-stone-300">Year</span>
					<input
						type="number"
						name="year"
						bind:value={manualYear}
						min="2000"
						step="1"
						placeholder="e.g. 2024"
						class="input-round w-full"
					/>
				</label>

				<label class="block space-y-1 text-sm">
					<span class="font-bold text-stone-700 dark:text-stone-300">Cover URL</span>
					<input
						type="url"
						name="coverUrl"
						bind:value={manualCoverUrl}
						placeholder="https://example.com/cover.jpg"
						class="input-round w-full"
					/>
				</label>

				<div class="flex justify-end gap-2 pt-2">
					<button
						type="button"
						onclick={onClose}
						class="rounded-full px-5 py-2.5 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-700"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn-primary inline-flex items-center gap-1 px-5 py-2.5 text-sm"
					>
						<Plus size={16} weight="bold" />
						Add to list
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
