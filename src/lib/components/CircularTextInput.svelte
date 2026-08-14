<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Lock, User } from 'phosphor-svelte';

	const MAX_CHARS = 30;
	const DEGREES_PER_CHAR = 360 / MAX_CHARS;

	interface Props {
		name: string;
		label: string;
		type?: 'text' | 'password';
		autocomplete?: HTMLInputElement['autocomplete'];
		required?: boolean;
		id?: string;
		placeholder?: string;
		class?: string;
	}

	let {
		name,
		label,
		type = 'text',
		autocomplete,
		required = false,
		id,
		placeholder = '',
		class: className
	}: Props = $props();

	let value = $state('');
	let focused = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);

	const displayChars = $derived(
		value.split('').map((char, index) => ({
			display: type === 'password' ? '●' : char,
			index
		}))
	);

	const nextCharAngle = $derived(-90 + displayChars.length * DEGREES_PER_CHAR);

	function charTransform(index: number): string {
		const angle = -90 + index * DEGREES_PER_CHAR;
		return `rotate(${angle} 120 120)`;
	}

	function focusInput() {
		inputEl?.focus();
	}
</script>

<div class={cn('flex flex-col items-center gap-2', className)}>
	<div
		role="presentation"
		class="group relative size-48 cursor-text rounded-full border-2 border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] transition-all sm:size-56 {focused
			? 'border-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.25)] dark:border-amber-500'
			: 'hover:border-amber-300 dark:hover:border-amber-600'}"
		onclick={focusInput}
		onkeydown={(event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				focusInput();
			}
		}}
	>
		<svg
			viewBox="0 0 240 240"
			class="size-full text-stone-700 dark:text-stone-200"
			aria-hidden="true"
		>
			<circle
				cx="120"
				cy="120"
				r="112"
				fill="rgb(var(--color-surface))"
				stroke="currentColor"
				stroke-width="1"
				class="opacity-20"
			/>
			<circle
				cx="120"
				cy="120"
				r="98"
				fill="none"
				stroke="currentColor"
				stroke-width="0.75"
				class="opacity-15"
			/>
			<circle
				cx="120"
				cy="120"
				r="86"
				fill="none"
				stroke="currentColor"
				stroke-width="0.75"
				class="opacity-10"
			/>
			<circle
				cx="120"
				cy="120"
				r="74"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				class="text-amber-400/40 dark:text-amber-500/35"
			/>

			{#each displayChars as { display, index } (index)}
				<text
					x="120"
					y="46"
					text-anchor="middle"
					dominant-baseline="middle"
					transform={charTransform(index)}
					class="fill-stone-800 text-[13px] font-bold tracking-wide dark:fill-amber-50"
				>
					{display}
				</text>
			{/each}

			{#if focused && displayChars.length < MAX_CHARS}
				<circle
					cx="120"
					cy="46"
					r="2.5"
					transform="rotate({nextCharAngle} 120 120)"
					class="fill-amber-500"
				/>
			{/if}

			<circle cx="120" cy="120" r="34" class="fill-amber-400 dark:fill-amber-500" />
			<circle cx="120" cy="120" r="8" class="fill-stone-900 dark:fill-stone-950" />
			<circle cx="120" cy="120" r="2.5" class="fill-stone-600 dark:fill-stone-400" />
		</svg>

		{#if value.length === 0 && placeholder}
			<svg
				viewBox="0 0 240 240"
				class="pointer-events-none absolute inset-0 size-full"
				aria-hidden="true"
			>
				<text
					x="120"
					y="46"
					text-anchor="middle"
					dominant-baseline="middle"
					transform="rotate(-90 120 120)"
					class="fill-[rgb(var(--color-text-tertiary))] text-[11px] font-semibold tracking-widest uppercase"
				>
					{placeholder}
				</text>
			</svg>
		{/if}

		<div
			class="pointer-events-none absolute right-[calc(50%-1rem)] bottom-3 flex size-8 items-center justify-center rounded-full bg-stone-900/10 dark:bg-stone-950/30"
			aria-hidden="true"
		>
			{#if type === 'password'}
				<Lock size={14} weight="bold" class="text-stone-700 dark:text-stone-300" />
			{:else}
				<User size={14} weight="bold" class="text-stone-700 dark:text-stone-300" />
			{/if}
		</div>

		<input
			bind:this={inputEl}
			{id}
			{name}
			{type}
			bind:value
			maxlength={MAX_CHARS}
			{autocomplete}
			{required}
			class="absolute inset-0 cursor-text rounded-full opacity-0"
			onfocus={() => (focused = true)}
			onblur={() => (focused = false)}
			aria-label={label}
		/>
	</div>

	<span class="text-xs font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase">
		{label}
		<span class="font-medium text-[rgb(var(--color-text-tertiary))] normal-case">
			· {value.length}/{MAX_CHARS}
		</span>
	</span>
</div>
