<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import VinylDisc from '$lib/components/VinylDisc.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { settings, type DiscRpm } from '$lib/stores/settings.svelte';
	import {
		ArrowCounterClockwise,
		BookOpen,
		FilmStrip,
		Moon,
		Sun,
		VinylRecord
	} from 'phosphor-svelte';

	let { data } = $props();

	const icons = {
		movie: FilmStrip,
		music: VinylRecord,
		book: BookOpen
	} as const;

	const RPM_STOPS: DiscRpm[] = [33, 45, 78];
	const KNOB_ANGLES: Record<DiscRpm, number> = { 33: -50, 45: 0, 78: 50 };

	const knobAngle = $derived(KNOB_ANGLES[settings.discRpm]);

	const maxTotal = $derived(Math.max(1, ...data.summary.map((row) => row.owned + row.wishlist)));

	function cycleRpm() {
		const index = RPM_STOPS.indexOf(settings.discRpm);
		settings.setDiscRpm(RPM_STOPS[(index + 1) % RPM_STOPS.length]);
	}

	function onMotionInput(event: Event & { currentTarget: HTMLInputElement }) {
		settings.setMotion(event.currentTarget.value === '1' ? 'full' : 'reduced');
	}

	function onDensityInput(event: Event & { currentTarget: HTMLInputElement }) {
		settings.setDensity(event.currentTarget.value === '1' ? 'cozy' : 'compact');
	}
</script>

<svelte:head>
	<title>Settings · Media Club</title>
</svelte:head>

<PageShell
	title="Settings"
	description="The control booth. Preferences are saved on this device only."
>
	<div class="console surface-round">
		<!-- Brand strip -->
		<div class="console-head">
			<span class="console-brand">
				<span class="led led--pulse" aria-hidden="true"></span>
				Media Club · Control Booth
			</span>
			<button type="button" class="reset-btn" onclick={() => settings.reset()}>
				<ArrowCounterClockwise size={13} weight="bold" />
				Reset booth
			</button>
		</div>

		<div class="console-grid">
			<!-- Appearance module -->
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

			<!-- Turntable module -->
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
						<div
							class="knob-preview"
							style:--spin-period="{settings.spinPeriodMs}ms"
							aria-hidden="true"
						>
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

			<!-- Faders module -->
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

			<!-- Levels module -->
			<section class="module module--wide" aria-labelledby="module-levels">
				<h2 id="module-levels" class="module-title">
					<span class="led" aria-hidden="true"></span>
					Levels
				</h2>

				<div class="meters">
					{#each data.summary as row (row.category)}
						{@const Icon = icons[row.category]}
						{@const total = row.owned + row.wishlist}
						{@const pct = Math.max(8, (total / maxTotal) * 100)}
						<div class="meter">
							<div class="meter-track">
								<div class="meter-fill" style:height="{pct}%"></div>
							</div>
							<span class="meter-icon">
								<Icon size={14} weight="bold" />
							</span>
							<span class="meter-label">{row.label}</span>
							<span class="meter-count">{row.owned} owned · {row.wishlist} wished</span>
						</div>
					{/each}
				</div>

				<p class="hint">Live signal from the collection — not a knob, just bragging rights.</p>
			</section>
		</div>
	</div>
</PageShell>

<style>
	.console {
		max-width: 56rem;
		padding: 1.25rem 1.25rem 1.75rem;
		background:
			radial-gradient(120% 80% at 50% 0%, rgb(var(--color-accent) / 0.06) 0%, transparent 60%),
			rgb(var(--color-surface));
	}

	@media (min-width: 640px) {
		.console {
			padding: 1.5rem 1.75rem 2rem;
		}
	}

	.console-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.25rem 0.5rem 1rem;
	}

	.console-brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.65rem;
		font-weight: 900;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgb(var(--color-text-secondary));
	}

	.reset-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.4rem 0.9rem;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-bg) / 0.6);
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: rgb(var(--color-text-secondary));
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			color 0.2s ease;
	}

	.reset-btn:hover {
		border-color: rgb(var(--color-accent));
		color: rgb(var(--color-text));
	}

	.console-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr;
	}

	@media (min-width: 768px) {
		.console-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.module--wide {
			grid-column: span 2;
		}
	}

	.module {
		border-radius: 1.75rem;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-bg) / 0.55);
		box-shadow: inset 0 1px 4px rgb(0 0 0 / 0.06);
		padding: 1.1rem 1.25rem 1.25rem;
	}

	.module-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 1rem;
		font-size: 0.7rem;
		font-weight: 900;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgb(var(--color-text-secondary));
	}

	.led {
		display: inline-block;
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 9999px;
		background: rgb(var(--color-accent));
		box-shadow: 0 0 6px rgb(var(--color-accent) / 0.8);
	}

	@keyframes led-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.35;
		}
	}

	.led--pulse {
		animation: led-pulse 2.4s ease-in-out infinite;
	}

	.hint {
		margin: 0.9rem 0 0;
		font-size: 0.72rem;
		font-weight: 500;
		line-height: 1.4;
		color: rgb(var(--color-text-tertiary));
	}

	/* ── Theme switch ─────────────────────────────── */
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

	/* ── RPM knob ─────────────────────────────────── */
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

	/* ── Faders ───────────────────────────────────── */
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

	/* ── VU meters ────────────────────────────────── */
	.meters {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: 2.25rem;
		padding: 0.5rem 0 0.25rem;
	}

	.meter {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
	}

	.meter-track {
		position: relative;
		width: 1.6rem;
		height: 8.5rem;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-bg));
		box-shadow: inset 0 2px 6px rgb(0 0 0 / 0.12);
		overflow: hidden;
	}

	@keyframes meter-rise {
		from {
			height: 0%;
		}
	}

	.meter-fill {
		position: absolute;
		bottom: 0;
		left: 0.2rem;
		right: 0.2rem;
		border-radius: 9999px;
		background: linear-gradient(
			0deg,
			rgb(var(--color-accent)) 0%,
			rgb(var(--color-accent)) 70%,
			rgb(239 68 68) 100%
		);
		box-shadow: 0 0 8px rgb(var(--color-accent) / 0.5);
		animation: meter-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.meter-icon {
		display: inline-flex;
		color: rgb(var(--color-accent-hover));
	}

	.meter-label {
		font-size: 0.62rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgb(var(--color-text-secondary));
	}

	.meter-count {
		font-size: 0.6rem;
		font-weight: 600;
		color: rgb(var(--color-text-tertiary));
		white-space: nowrap;
	}

	/* Motion preferences quiet the booth too */
	@media (prefers-reduced-motion: reduce) {
		.led--pulse,
		.meter-fill {
			animation: none;
		}
	}

	:global([data-motion='reduced']) .led--pulse,
	:global([data-motion='reduced']) .meter-fill {
		animation: none;
	}
</style>
