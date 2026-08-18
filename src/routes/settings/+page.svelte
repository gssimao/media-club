<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import SettingsAppearanceModule from '$lib/components/settings/SettingsAppearanceModule.svelte';
	import SettingsConsole from '$lib/components/settings/SettingsConsole.svelte';
	import SettingsFadersModule from '$lib/components/settings/SettingsFadersModule.svelte';
	import SettingsLevelsModule from '$lib/components/settings/SettingsLevelsModule.svelte';
	import SettingsTurntableModule from '$lib/components/settings/SettingsTurntableModule.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Settings · Media Club</title>
</svelte:head>

<PageShell
	title="Settings"
	description="The control booth. Preferences are saved on this device only."
>
	<SettingsConsole>
		<SettingsAppearanceModule />
		<SettingsTurntableModule />
		<SettingsFadersModule />
		<SettingsLevelsModule summary={data.summary} />
	</SettingsConsole>
</PageShell>
