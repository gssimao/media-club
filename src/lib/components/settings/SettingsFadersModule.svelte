<script lang="ts">
	import { settings } from '$lib/stores/settings.svelte';

	function onMotionInput(event: Event & { currentTarget: HTMLInputElement }) {
		settings.setMotion(event.currentTarget.value === '1' ? 'full' : 'reduced');
	}

	function onDensityInput(event: Event & { currentTarget: HTMLInputElement }) {
		settings.setDensity(event.currentTarget.value === '1' ? 'cozy' : 'compact');
	}
</script>

<section class="module module--wide" aria-labelledby="module-faders">
	<h2 id="module-faders" class="module-title">
		<span class="led" aria-hidden="true"></span>
		Faders
	</h2>

	<div class="fader-block">
		<div class="fader-head">
			<span>Motion</span>
			<span class="fader-value">{settings.motion === 'full' ? 'Full' : 'Reduced'}</span>
		</div>
		<div class="fader-row">
			<span class="fader-end">Reduced</span>
			<input
				class="fader"
				type="range"
				min="0"
				max="1"
				step="1"
				value={settings.motion === 'full' ? '1' : '0'}
				oninput={onMotionInput}
				aria-label="Motion level"
			/>
			<span class="fader-end">Full</span>
		</div>
		<p class="hint">Turns down spins, entrances, and hover animation across the app.</p>
	</div>

	<div class="fader-block">
		<div class="fader-head">
			<span>Shelf density</span>
			<span class="fader-value">{settings.density === 'cozy' ? 'Cozy' : 'Compact'}</span>
		</div>
		<div class="fader-row">
			<span class="fader-end">Compact</span>
			<input
				class="fader"
				type="range"
				min="0"
				max="1"
				step="1"
				value={settings.density === 'cozy' ? '1' : '0'}
				oninput={onDensityInput}
				aria-label="Shelf density"
			/>
			<span class="fader-end">Cozy</span>
		</div>
		<p class="hint">Cozy shows bigger discs; Compact fits more per shelf row.</p>
	</div>
</section>

<style>
	.fader-block + .fader-block {
		margin-top: 1.25rem;
	}

	.fader-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 0.35rem;
		font-size: 0.72rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgb(var(--color-text-secondary));
	}

	.fader-value {
		color: rgb(var(--color-accent-hover));
	}

	.fader-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.fader-end {
		font-size: 0.6rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgb(var(--color-text-tertiary));
		white-space: nowrap;
	}

	.fader {
		appearance: none;
		flex: 1;
		height: 2.25rem;
		background: transparent;
		cursor: pointer;
	}

	.fader::-webkit-slider-runnable-track {
		height: 0.55rem;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: linear-gradient(180deg, rgb(0 0 0 / 0.12) 0%, rgb(var(--color-bg)) 100%);
	}

	.fader::-webkit-slider-thumb {
		appearance: none;
		width: 2.6rem;
		height: 1.5rem;
		margin-top: calc((0.55rem - 1.5rem) / 2);
		border-radius: 9999px;
		border: 2px solid rgb(var(--color-accent));
		background: linear-gradient(
			90deg,
			rgb(var(--color-surface-raised)) 0%,
			rgb(var(--color-surface-raised)) 44%,
			rgb(var(--color-accent)) 44%,
			rgb(var(--color-accent)) 56%,
			rgb(var(--color-surface-raised)) 56%,
			rgb(var(--color-surface-raised)) 100%
		);
		box-shadow: 0 2px 6px rgb(0 0 0 / 0.25);
	}

	.fader::-moz-range-track {
		height: 0.55rem;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: linear-gradient(180deg, rgb(0 0 0 / 0.12) 0%, rgb(var(--color-bg)) 100%);
	}

	.fader::-moz-range-thumb {
		width: 2.6rem;
		height: 1.5rem;
		border-radius: 9999px;
		border: 2px solid rgb(var(--color-accent));
		background: linear-gradient(
			90deg,
			rgb(var(--color-surface-raised)) 0%,
			rgb(var(--color-surface-raised)) 44%,
			rgb(var(--color-accent)) 44%,
			rgb(var(--color-accent)) 56%,
			rgb(var(--color-surface-raised)) 56%,
			rgb(var(--color-surface-raised)) 100%
		);
		box-shadow: 0 2px 6px rgb(0 0 0 / 0.25);
	}
</style>
