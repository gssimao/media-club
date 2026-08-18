<script lang="ts">
	import { enhance } from '$app/forms';
	import { X, FolderPlus } from 'phosphor-svelte';
	import type { MediaCategory } from '$lib/types/media';

	interface Props {
		category: MediaCategory;
		isOpen: boolean;
		onClose: () => void;
	}

	let { category, isOpen, onClose }: Props = $props();

	let albumTitle = $state('');

	$effect(() => {
		if (!isOpen) {
			albumTitle = '';
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
		aria-labelledby="folder-dialog-title"
		tabindex="-1"
	>
		<div class="surface-round relative w-full max-w-md p-6" onclick={(e) => e.stopPropagation()}>
			<div class="mb-6 flex items-start justify-between">
				<div>
					<h2 id="folder-dialog-title" class="text-2xl font-bold text-stone-900 dark:text-amber-50">
						Create Album
					</h2>
					<p class="mt-1 text-sm font-medium text-stone-600 dark:text-stone-400">
						Add a new album to organize your collection
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
				action="/admin/albums?/createAlbum"
				class="space-y-4"
				use:enhance={() => {
					return async ({ result, update }) => {
						await update();
						if (result.type === 'success' || result.type === 'redirect') {
							onClose();
							setTimeout(() => {
								window.location.reload();
							}, 100);
						}
					};
				}}
			>
				<input type="hidden" name="category" value={category} />

				<label class="block space-y-1 text-sm">
					<span class="font-bold text-stone-700 dark:text-stone-300">Album Title *</span>
					<input
						type="text"
						name="title"
						bind:value={albumTitle}
						required
						placeholder="e.g. Wes Anderson, Sci-Fi Classics"
						class="input-round w-full"
						autofocus
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
					<button type="submit" class="btn-primary px-5 py-2.5 text-sm">
						<FolderPlus size={16} weight="bold" />
						Create Album
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
