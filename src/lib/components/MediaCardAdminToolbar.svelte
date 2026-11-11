<script lang="ts" module>
	export type MediaCardAdminAction = 'move' | 'notes' | 'cover' | 'delete';
</script>

<script lang="ts">
	import type { MediaItem } from '$lib/types/media';
	import CardOptionsMenu, { type CardMenuAction } from './CardOptionsMenu.svelte';
	import { Check, Image, PencilSimple, Trash } from 'phosphor-svelte';

	interface Props {
		item: MediaItem;
		/** Whether the options menu is showing. */
		open?: boolean;
		onAction: (action: MediaCardAdminAction) => void;
	}

	let { item, open = $bindable(false), onAction }: Props = $props();

	const actions = $derived.by(() => {
		const list: CardMenuAction<MediaCardAdminAction>[] = [];
		if (item.listType === 'wishlist') {
			list.push({ id: 'move', label: 'Move to collection', icon: Check, tone: 'accent' });
		}
		list.push({ id: 'notes', label: 'Edit notes', icon: PencilSimple });
		if (item.category === 'movie') {
			list.push({ id: 'cover', label: 'Change cover', icon: Image });
		}
		list.push({ id: 'delete', label: 'Delete item', icon: Trash, tone: 'danger' });
		return list;
	});
</script>

<CardOptionsMenu
	menuId="item-menu-{item.id}"
	triggerLabel="Item options for {item.title}"
	subject={item.title}
	{actions}
	bind:open
	onSelect={onAction}
/>
