<script lang="ts">
	import { enhance } from '$app/forms';
	import PageShell from '$lib/components/PageShell.svelte';
	import CoverImage from '$lib/components/CoverImage.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import { Check, Plus, Stack, MagnifyingGlass } from 'phosphor-svelte';
	import { toast } from '$lib/stores/toast.svelte';

	let { data, form } = $props();
	let selected = $state<string[]>([]);
	let query = $state('');
	let hideCollected = $state(true);
	let allowMove = $state(false);
	let saving = $state(false);
	const albumNames = $derived(new Map(data.albums.map((album) => [album.id, album.title])));
	const candidates = $derived(data.items.filter((item) => item.albumId !== data.album.id));
	const visible = $derived(
		candidates.filter(
			(item) =>
				(!hideCollected || !item.albumId) &&
				`${item.title} ${item.year ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())
		)
	);
	const moving = $derived(candidates.filter((item) => selected.includes(item.id) && item.albumId));
	const hiddenCount = $derived(
		selected.filter((id) => !visible.some((item) => item.id === id)).length
	);
</script>

<svelte:head><title>Add to {data.album.title} · Media Club</title></svelte:head>

<PageShell
	title="Add {data.label.toLowerCase()} I own"
	description="Select from your library for {data.album.title}. Nothing changes until you confirm."
>
	{#snippet controls()}<NavLink href="/albums/{data.album.category}/{data.album.id}"
			>Back to collection</NavLink
		>{/snippet}
	<form
		method="POST"
		use:enhance={() => {
			saving = true;
			return async ({ result, update }) => {
				saving = false;
				if (result.type === 'error')
					toast.error('Could not save your selection. Please try again.');
				else if (result.type === 'redirect')
					toast.success(`Added ${selected.length} to ${data.album.title}.`);
				await update({ reset: false });
			};
		}}
	>
		<fieldset disabled={saving} class="min-w-0">
			<div class="selection-filters surface-round">
				<label class="search-field"
					><MagnifyingGlass size={18} /><span class="sr-only"
						>Search owned {data.label.toLowerCase()}</span
					><input
						type="search"
						bind:value={query}
						placeholder="Search your {data.label.toLowerCase()}"
						class="input-round"
					/></label
				>
				<label class="filter-toggle"
					><input type="checkbox" bind:checked={hideCollected} />Hide items in other collections</label
				>
			</div>
			<div class="selection-summary">
				<span>{visible.length} available</span><span
					>{data.items.length - candidates.length} already in this collection</span
				>
			</div>
			{#if form?.message}<p class="mb-4 text-sm text-red-700 dark:text-red-300" role="alert">
					{form.message}
				</p>{/if}
			{#each selected as id (id)}<input type="hidden" name="ids" value={id} />{/each}
			<div class="selection-grid">
				{#each visible as item (item.id)}
					<label class="select-card" class:is-selected={selected.includes(item.id)}>
						<input
							type="checkbox"
							value={item.id}
							bind:group={selected}
							class="sr-only"
							aria-label="Select {item.title}"
						/>
						<span class="selection-poster">
							{#if item.coverUrl}<CoverImage
									src={item.coverUrl}
									alt=""
									class="size-full object-cover"
								/>{:else}<Stack size={36} />{/if}
							<span class="selection-check" aria-hidden="true"
								>{#if selected.includes(item.id)}<Check size={17} weight="bold" />{:else}<Plus
										size={17}
									/>{/if}</span
							>
						</span>
						<span class="item-title">{item.title}</span><span class="item-meta"
							>{item.year ?? 'Year unknown'}</span
						>
						{#if item.albumId}<span class="move-label"
								>From {albumNames.get(item.albumId) ?? 'another collection'}</span
							>{/if}
					</label>
				{:else}<p class="empty-selection">
						{query
							? 'No matches. Try a different title.'
							: hideCollected
								? 'No uncollected items. Turn off the filter to choose from other collections.'
								: 'Everything you own is already in this collection.'}
					</p>{/each}
			</div>
			<div class="selection-bar surface-round">
				<div class="selection-count" aria-live="polite">
					<strong>{selected.length} selected</strong>{#if hiddenCount}<span
							>{hiddenCount} hidden by filters</span
						>{/if}
				</div>
				{#if moving.length}<label class="move-confirm"
						><input name="allowMove" value="true" type="checkbox" bind:checked={allowMove} />Move {moving.length}
						from their current collections</label
					>{/if}
				<div class="selection-actions">
					<button
						type="button"
						class="btn-secondary"
						disabled={!selected.length}
						onclick={() => {
							selected = [];
							allowMove = false;
						}}>Clear</button
					><button
						type="submit"
						class="btn-primary"
						disabled={!selected.length || (moving.length > 0 && !allowMove)}
						><Plus size={18} />{saving
							? 'Adding…'
							: `Confirm ${selected.length || ''} selection${selected.length === 1 ? '' : 's'}`}</button
					>
				</div>
			</div>
		</fieldset>
	</form>
</PageShell>

<style>
	.selection-filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
	}
	.search-field {
		position: relative;
		flex: 1 1 16rem;
		display: flex;
		align-items: center;
	}
	.search-field :global(svg) {
		position: absolute;
		left: 0.85rem;
		color: rgb(var(--color-text-secondary));
	}
	.search-field input {
		width: 100%;
		padding-left: 2.5rem;
	}
	.filter-toggle,
	.move-confirm {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 44px;
		font-size: 0.8125rem;
		cursor: pointer;
	}
	input[type='checkbox'] {
		width: 18px;
		height: 18px;
		accent-color: rgb(var(--color-accent-hover));
		flex-shrink: 0;
	}
	.selection-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		padding-block: 1.25rem;
		color: rgb(var(--color-text-secondary));
		font-size: 0.8125rem;
	}
	.selection-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
		gap: 1.5rem 1rem;
		padding-bottom: 2rem;
	}
	.select-card {
		display: flex;
		flex-direction: column;
		min-width: 0;
		cursor: pointer;
		border-radius: 0.75rem;
	}
	.selection-poster {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 2 / 3;
		overflow: hidden;
		border-radius: 0.75rem;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-surface-raised));
		color: rgb(var(--color-text-tertiary));
		transition:
			transform 180ms ease,
			box-shadow 180ms ease;
	}
	.select-card:hover .selection-poster {
		transform: translateY(-3px);
	}
	.is-selected .selection-poster {
		box-shadow: 0 0 0 3px rgb(var(--color-accent-hover));
	}
	.select-card:has(input:focus-visible) {
		outline: 3px solid rgb(var(--color-secondary));
		outline-offset: 5px;
	}
	.selection-check {
		position: absolute;
		right: 8px;
		top: 8px;
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		color: rgb(var(--color-text));
		background: rgb(var(--color-surface-raised));
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.2);
	}
	.is-selected .selection-check {
		color: rgb(var(--vinyl-ink));
		background: rgb(var(--vinyl-paper));
	}
	.item-title {
		font-size: 0.875rem;
		font-weight: 550;
		line-height: 1.35;
		margin-top: 0.7rem;
	}
	.item-meta,
	.move-label {
		font-size: 0.75rem;
		color: rgb(var(--color-text-secondary));
		margin-top: 0.25rem;
	}
	.move-label {
		color: rgb(var(--color-accent-hover));
	}
	.empty-selection {
		grid-column: 1 / -1;
		padding: 2rem 0;
		color: rgb(var(--color-text-secondary));
	}
	.selection-bar {
		position: sticky;
		bottom: 6rem;
		z-index: 10;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 1rem;
		box-shadow: 0 8px 32px rgb(0 0 0 / 0.12);
	}
	.selection-count {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.875rem;
	}
	.selection-count span {
		font-size: 0.75rem;
		color: rgb(var(--color-text-secondary));
	}
	.selection-actions {
		display: flex;
		gap: 0.5rem;
	}
	.selection-actions button {
		padding-inline: 1rem;
	}
	@media (min-width: 1100px) {
		.selection-bar {
			bottom: 1.5rem;
		}
	}
	@media (max-width: 480px) {
		.selection-actions {
			width: 100%;
		}
		.selection-actions button:last-child {
			flex: 1;
		}
	}
</style>
