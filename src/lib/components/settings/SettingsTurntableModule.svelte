<script lang="ts">
	import VinylDisc from '$lib/components/VinylDisc.svelte';
	import { settings, type DiscRpm } from '$lib/stores/settings.svelte';

	const RPM_STOPS: DiscRpm[] = [33, 45, 78];
	const KNOB_ANGLES: Record<DiscRpm, number> = { 33: -50, 45: 0, 78: 50 };

	const knobAngle = $derived(KNOB_ANGLES[settings.discRpm]);

	function cycleRpm() {
		const index = RPM_STOPS.indexOf(settings.discRpm);
		settings.setDiscRpm(RPM_STOPS[(index + 1) % RPM_STOPS.length]);
	}
</script>

<section class="module" aria-labelledby="module-turntable">
	<h2 id="module-turntable" class="module-title">
		<span class="led" aria-hidden="true"></span>
		Turntable
	</h2>

	<div class="knob-row">
		<div class="knob-stack">
			<div class="knob-marks" aria-hidden="true">
				<span>33</span>
				<span>45</span>
				<span>78</span>
			</div>
			<button
				type="button"
				class="knob"
				onclick={cycleRpm}
				aria-label="Disc speed {settings.discRpm} RPM — activate to cycle"
			>
				<span class="knob-face" style:transform="rotate({knobAngle}deg)">
					<span class="knob-needle" aria-hidden="true"></span>
				</span>
			</button>
		</div>

		<div class="knob-side">
			<div class="knob-preview" style:--spin-period="{settings.spinPeriodMs}ms" aria-hidden="true">
				<VinylDisc spinning class="size-14" />
			</div>
			<div role="radiogroup" aria-label="Disc speed" class="rpm-pills">
				{#each RPM_STOPS as rpm (rpm)}
					<button
						type="button"
						role="radio"
						aria-checked={settings.discRpm === rpm}
						class={['rpm-pill', settings.discRpm === rpm && 'is-active']}
						onclick={() => settings.setDiscRpm(rpm)}
					>
						{rpm}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<p class="hint">Sets how fast the home page disc spins. RPM is a vibe, not a law.</p>
</section>

<style>
	.knob-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.knob-stack {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
	}

	.knob-marks {
		display: flex;
		justify-content: space-between;
		width: 6.5rem;
		font-size: 0.6rem;
		font-weight: 900;
		letter-spacing: 0.05em;
		color: rgb(var(--color-text-tertiary));
	}

	.knob-marks span:nth-child(2) {
		transform: translateY(-0.2rem);
	}

	.knob {
		width: 5.5rem;
		height: 5.5rem;
		padding: 0;
		border-radius: 9999px;
		border: 2px solid rgb(var(--color-border));
		background: rgb(var(--color-bg));
		box-shadow:
			inset 0 2px 6px rgb(0 0 0 / 0.12),
			0 2px 8px rgb(0 0 0 / 0.08);
		cursor: pointer;
		transition: border-color 0.2s ease;
	}

	.knob:hover {
		border-color: rgb(var(--color-accent));
	}

	.knob-face {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 9999px;
		background: radial-gradient(
			circle at 50% 30%,
			rgb(var(--color-surface-raised)) 0%,
			rgb(var(--color-surface)) 70%
		);
		transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.knob-needle {
		position: absolute;
		top: 0.4rem;
		left: 50%;
		width: 0.3rem;
		height: 1.4rem;
		border-radius: 9999px;
		background: rgb(var(--color-accent));
		box-shadow: 0 0 6px rgb(var(--color-accent) / 0.7);
		transform: translateX(-50%);
	}

	.knob-side {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
	}

	.knob-preview {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.rpm-pills {
		display: flex;
		gap: 0.35rem;
	}

	.rpm-pill {
		padding: 0.3rem 0.7rem;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: transparent;
		font-size: 0.68rem;
		font-weight: 900;
		color: rgb(var(--color-text-secondary));
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease;
	}

	.rpm-pill:hover {
		border-color: rgb(var(--color-accent));
	}

	.rpm-pill.is-active {
		background: rgb(var(--color-accent));
		border-color: rgb(var(--color-accent));
		color: rgb(40 35 28);
	}
</style>
