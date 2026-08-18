<script lang="ts">
	import { enhance } from '$app/forms';
	import { IMPORT_JSON_EXAMPLE } from '$lib/import-json-example';
	import { toast } from '$lib/stores/toast.svelte';
	import { FileArrowUp, X } from 'phosphor-svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	let payload = $state('');
	let fileName = $state('');
	let importing = $state(false);

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !importing) onClose();
	}

	async function onFileSelected(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
			toast.error('Please choose a .json file.');
			input.value = '';
			return;
		}

		try {
			payload = await file.text();
			fileName = file.name;
		} catch {
			toast.error('Could not read that file.');
			input.value = '';
		}
	}

	function handleClose() {
		if (importing) return;
		onClose();
	}
</script>

<svelte:window onkeydown={open ? onKeydown : undefined} />

{#if open}
	<div
		class="import-dialog anim-fade"
		role="dialog"
		aria-modal="true"
		aria-labelledby="import-dialog-title"
	>
		<button
			type="button"
			class="import-dialog__backdrop"
			aria-label="Close import dialog"
			disabled={importing}
			onclick={handleClose}
		></button>

		<div class="import-dialog__panel surface-round anim-rise">
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0 flex-1">
					<h2
						id="import-dialog-title"
						class="text-sm font-black tracking-wide text-stone-900 uppercase dark:text-amber-50"
					>
						Import catalog JSON
					</h2>
					<p class="mt-2 text-sm leading-snug font-medium text-[rgb(var(--color-text-secondary))]">
						Bulk-add movies, music, books, and wishlist items. Duplicates (same category, listType,
						and externalId) are skipped.
					</p>
				</div>
				<button
					type="button"
					class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] transition-colors hover:bg-black/5 hover:text-[rgb(var(--color-text))] disabled:opacity-50 dark:hover:bg-white/10"
					aria-label="Close import dialog"
					disabled={importing}
					onclick={handleClose}
				>
					<X size={16} weight="bold" />
				</button>
			</div>

			<div class="mt-4 space-y-3">
				<div
					class="surface-round space-y-2 bg-[rgb(var(--color-surface))] p-3 dark:bg-stone-900/40"
				>
					<p
						class="text-[11px] font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase"
					>
						Format
					</p>
					<ul class="space-y-1 text-xs leading-relaxed text-[rgb(var(--color-text-secondary))]">
						<li>
							Use top-level arrays <code
								class="rounded-full bg-[rgb(var(--color-accent-light))] px-1.5 py-0.5 text-[10px]"
								>movies</code
							>,
							<code
								class="rounded-full bg-[rgb(var(--color-accent-light))] px-1.5 py-0.5 text-[10px]"
								>music</code
							>,
							<code
								class="rounded-full bg-[rgb(var(--color-accent-light))] px-1.5 py-0.5 text-[10px]"
								>books</code
							>
							for owned items, or
							<code
								class="rounded-full bg-[rgb(var(--color-accent-light))] px-1.5 py-0.5 text-[10px]"
								>wishlist</code
							>
							with a
							<code
								class="rounded-full bg-[rgb(var(--color-accent-light))] px-1.5 py-0.5 text-[10px]"
								>category</code
							>
							on each row.
						</li>
						<li>
							Or provide a flat
							<code
								class="rounded-full bg-[rgb(var(--color-accent-light))] px-1.5 py-0.5 text-[10px]"
								>items</code
							>
							array with
							<code
								class="rounded-full bg-[rgb(var(--color-accent-light))] px-1.5 py-0.5 text-[10px]"
								>category</code
							>
							and
							<code
								class="rounded-full bg-[rgb(var(--color-accent-light))] px-1.5 py-0.5 text-[10px]"
								>listType</code
							>.
						</li>
						<li>
							Each entry needs <strong>externalId</strong> and <strong>title</strong>; optional
							year, subtitle, coverUrl, notes, metadata.
						</li>
					</ul>
					<pre
						class="max-h-40 overflow-auto rounded-[1.5rem] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] p-3 text-[10px] leading-relaxed text-[rgb(var(--color-text-secondary))]"><code
							>{IMPORT_JSON_EXAMPLE}</code
						></pre>
				</div>

				<label class="block space-y-1.5">
					<span
						class="text-xs font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase"
					>
						Upload .json file
					</span>
					<input
						type="file"
						accept=".json,application/json"
						class="block w-full text-xs text-[rgb(var(--color-text-secondary))] file:mr-3 file:rounded-full file:border-0 file:bg-amber-400 file:px-4 file:py-2 file:text-[10px] file:font-black file:tracking-wide file:text-stone-900 file:uppercase"
						disabled={importing}
						onchange={onFileSelected}
					/>
					{#if fileName}
						<span class="text-[11px] font-medium text-amber-700 dark:text-amber-400">
							Loaded {fileName}
						</span>
					{/if}
				</label>

				<label class="block space-y-1.5">
					<span
						class="text-xs font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase"
					>
						Or paste JSON
					</span>
					<textarea
						bind:value={payload}
						rows="8"
						placeholder="Paste your catalog JSON here…"
						disabled={importing}
						class="w-full rounded-[2rem] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] px-4 py-3 font-mono text-[11px] leading-relaxed text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:border-amber-400 focus:outline-none"
					></textarea>
				</label>
			</div>

			<form
				method="POST"
				action="?/importJson"
				class="mt-5 flex flex-wrap justify-end gap-2"
				use:enhance={() => {
					importing = true;
					return async ({ result, update }) => {
						importing = false;
						if (result.type === 'failure') {
							toast.error(String(result.data?.message ?? 'Import failed.'));
						} else if (result.type === 'success') {
							const data = result.data as {
								inserted?: number;
								skipped?: number;
								errors?: string[];
							};
							const inserted = data.inserted ?? 0;
							const skipped = data.skipped ?? 0;
							const errorCount = data.errors?.length ?? 0;
							let message = `Imported ${inserted} item${inserted === 1 ? '' : 's'}`;
							if (skipped > 0)
								message += `, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}`;
							if (errorCount > 0) message += ` (${errorCount} error${errorCount === 1 ? '' : 's'})`;
							toast.success(`${message}.`);
							payload = '';
							fileName = '';
							onClose();
						}
						await update();
					};
				}}
			>
				<input type="hidden" name="payload" value={payload} />
				<button
					type="button"
					class="btn-secondary px-5 py-2 text-xs"
					disabled={importing}
					onclick={handleClose}
				>
					Cancel
				</button>
				<button
					type="submit"
					class="btn-primary px-5 py-2 text-xs"
					disabled={importing || !payload.trim()}
				>
					<FileArrowUp size={14} weight="bold" />
					{importing ? 'Importing…' : 'Import JSON'}
				</button>
			</form>
		</div>
	</div>
{/if}

<style>
	.import-dialog {
		position: fixed;
		inset: 0;
		z-index: 95;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
	}

	.import-dialog__backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgb(0 0 0 / 0.58);
		backdrop-filter: blur(4px);
		cursor: pointer;
	}

	.import-dialog__backdrop:disabled {
		cursor: default;
	}

	.import-dialog__panel {
		position: relative;
		z-index: 1;
		width: min(100%, 36rem);
		max-height: min(92vh, 52rem);
		overflow: auto;
		padding: 1.25rem;
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.4);
	}
</style>
