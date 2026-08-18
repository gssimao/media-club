<script lang="ts">
	import { Moon, Sun } from 'phosphor-svelte';
	import { theme } from '$lib/stores/theme.svelte';
</script>

<section class="module" aria-labelledby="module-appearance">
	<h2 id="module-appearance" class="module-title">
		<span class="led" aria-hidden="true"></span>
		Lighting
	</h2>

	<div class="switch-row">
		<span class={['switch-side', theme.current === 'dark' && 'is-dim']}>
			<Sun size={16} weight="bold" />
			Day
		</span>
		<button
			type="button"
			role="switch"
			aria-checked={theme.current === 'dark'}
			aria-label="Night mode"
			class={['switch', theme.current === 'dark' && 'is-on']}
			onclick={() => theme.toggle()}
		>
			<span class="switch-thumb" aria-hidden="true"></span>
		</button>
		<span class={['switch-side', theme.current !== 'dark' && 'is-dim']}>
			<Moon size={16} weight="bold" />
			Night
		</span>
	</div>

	<p class="hint">Warm daylight or late-night video store.</p>
</section>

<style>
	.switch-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 0.75rem 0;
	}

	.switch-side {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.72rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgb(var(--color-text));
		transition: opacity 0.2s ease;
	}

	.switch-side.is-dim {
		opacity: 0.4;
	}

	.switch {
		position: relative;
		width: 4rem;
		height: 2.1rem;
		border-radius: 9999px;
		border: 2px solid rgb(var(--color-border));
		background: rgb(var(--color-bg));
		cursor: pointer;
		transition:
			border-color 0.25s ease,
			box-shadow 0.25s ease;
	}

	.switch.is-on {
		border-color: rgb(var(--color-accent));
		box-shadow: 0 0 12px rgb(var(--color-accent) / 0.35);
	}

	.switch-thumb {
		position: absolute;
		top: 50%;
		left: 0.25rem;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 9999px;
		background: rgb(var(--color-accent));
		box-shadow: 0 1px 4px rgb(0 0 0 / 0.3);
		transform: translateY(-50%);
		transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.switch.is-on .switch-thumb {
		transform: translateY(-50%) translateX(1.85rem);
	}
</style>
