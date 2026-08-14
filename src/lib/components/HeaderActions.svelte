<script lang="ts">
	import { Moon, SignOut, Sun, Gear } from 'phosphor-svelte';
	import { theme } from '$lib/stores/theme.svelte';

	interface Props {
		showLogout?: boolean;
	}

	let { showLogout = false }: Props = $props();
</script>

<div class="header-actions">
	<a href="/settings" class="action-btn" aria-label="Settings">
		<Gear size={16} weight="bold" />
	</a>

	<button type="button" class="action-btn" onclick={() => theme.toggle()} aria-label="Toggle theme">
		{#if theme.current === 'dark'}
			<Sun size={16} weight="bold" />
		{:else}
			<Moon size={16} weight="bold" />
		{/if}
	</button>

	{#if showLogout}
		<form method="POST" action="/logout">
			<button type="submit" class="action-btn" aria-label="Log out">
				<SignOut size={16} weight="bold" />
			</button>
		</form>
	{/if}
</div>

<style>
	.header-actions {
		display: flex;
		gap: 0.35rem;
	}

	.action-btn {
		display: inline-flex;
		width: var(--action-btn-size, 2.25rem);
		height: var(--action-btn-size, 2.25rem);
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-surface-raised) / 0.92);
		color: rgb(var(--color-text-secondary));
		cursor: pointer;
		backdrop-filter: blur(6px);
		text-decoration: none;
	}

	.action-btn:hover {
		border-color: rgb(var(--color-accent));
		color: rgb(var(--color-text));
	}
</style>
