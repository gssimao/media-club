<script lang="ts">
	import { Moon, SignOut, Sun, Gear } from 'phosphor-svelte';
	import { theme } from '$lib/stores/theme.svelte';

	interface Props {
		showLogout?: boolean;
		showSettings?: boolean;
	}

	let { showLogout = false, showSettings = true }: Props = $props();
</script>

<div class="header-actions">
	{#if showSettings}<a href="/settings" class="action-btn" aria-label="Settings">
			<Gear size={20} weight="regular" />
		</a>{/if}

	<button
		type="button"
		class="action-btn"
		onclick={() => theme.toggle()}
		aria-label={theme.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
	>
		{#if theme.current === 'dark'}
			<Sun size={20} weight="regular" />
		{:else}
			<Moon size={20} weight="regular" />
		{/if}
	</button>

	{#if showLogout}
		<form method="POST" action="/logout">
			<button type="submit" class="action-btn" aria-label="Log out">
				<SignOut size={20} weight="regular" />
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
		width: var(--action-btn-size, 2.75rem);
		height: var(--action-btn-size, 2.75rem);
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 1px solid transparent;
		background: transparent;
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
