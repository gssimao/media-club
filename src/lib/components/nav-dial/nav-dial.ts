import {
	BookOpen,
	Faders,
	FilmStrip,
	Heart,
	House,
	MonitorPlay,
	SignIn,
	UserGear,
	VinylRecord
} from 'phosphor-svelte';
import type { SessionUser } from '$lib/types/auth';
import type { Component } from 'svelte';

export type NavItem = {
	href: string;
	label: string;
	icon: Component<{ size?: number; weight?: 'bold' | 'regular' | 'fill' }>;
	match: (path: string) => boolean;
};

export const SELECTOR = 0;
/** Icon orbit as a fraction of `--nav-dial-r`; sits between middle (0.68) and outer (0.88) grooves. */
export const NODE_R_RATIO = 0.7;
export const grooveRadii = [0.88, 0.68, 0.48] as const;
export const tickAngles = [0, 45, 90, 135, 180, 225, 270, 315] as const;
export const CENTER_BOOST_THRESHOLD = 0.45;
export const CENTER_BOOST_MAX = 1.2;
export const DIAL_SNAP_MS = 450;
/** Extra degrees before switching sticky preview during drag (wider drop zone). */
export const SELECTOR_STICKINESS_DEG = 12;

const catalogItems: NavItem[] = [
	{ href: '/', label: 'Home', icon: House, match: (p) => p === '/' },
	{ href: '/movies', label: 'Movies', icon: FilmStrip, match: (p) => p.startsWith('/movies') },
	{ href: '/shows', label: 'Shows', icon: MonitorPlay, match: (p) => p.startsWith('/shows') },
	{ href: '/music', label: 'Music', icon: VinylRecord, match: (p) => p.startsWith('/music') },
	{ href: '/books', label: 'Books', icon: BookOpen, match: (p) => p.startsWith('/books') },
	{
		href: '/wishlist/movies',
		label: 'Wishlist',
		icon: Heart,
		match: (p) => p.startsWith('/wishlist')
	},
	{
		href: '/settings',
		label: 'Settings',
		icon: Faders,
		match: (p) => p.startsWith('/settings')
	}
];

export function buildNavItems(user: SessionUser | null): NavItem[] {
	return user
		? [
				...catalogItems,
				{
					href: '/admin',
					label: 'Admin',
					icon: UserGear,
					match: (p) => p.startsWith('/admin')
				}
			]
		: [
				...catalogItems,
				{
					href: '/login',
					label: 'Log in',
					icon: SignIn,
					match: (p) => p === '/login'
				}
			];
}

export function itemAnglesForCount(count: number): number[] {
	return Array.from({ length: count }, (_, i) => {
		if (count === 1) return SELECTOR;
		return (360 / count) * i;
	});
}

export function normalizeAngle(angle: number): number {
	return ((angle % 360) + 360) % 360;
}

export function angularDistance(from: number, to: number): number {
	const diff = normalizeAngle(from - to);
	return diff > 180 ? 360 - diff : diff;
}

export function unwrapAngleDelta(delta: number): number {
	let d = delta;
	while (d > 180) d -= 360;
	while (d < -180) d += 360;
	return d;
}

export function nearestItemIndex(
	itemAngles: number[],
	forRotation: number,
	selector = SELECTOR
): number {
	let best = 0;
	let bestDist = Infinity;
	for (let i = 0; i < itemAngles.length; i++) {
		const worldAngle = normalizeAngle(itemAngles[i] + forRotation);
		const dist = angularDistance(worldAngle, selector);
		if (dist < bestDist) {
			bestDist = dist;
			best = i;
		}
	}
	return best;
}

/** Keeps the current selection until another item is clearly closer to the selector. */
export function nearestItemIndexWithHysteresis(
	itemAngles: number[],
	forRotation: number,
	stickyIndex: number,
	selector = SELECTOR,
	stickinessDeg = SELECTOR_STICKINESS_DEG
): number {
	const candidate = nearestItemIndex(itemAngles, forRotation, selector);
	if (candidate === stickyIndex || itemAngles.length <= 1) return candidate;

	const stickyWorld = normalizeAngle(itemAngles[stickyIndex] + forRotation);
	const candidateWorld = normalizeAngle(itemAngles[candidate] + forRotation);
	const distSticky = angularDistance(stickyWorld, selector);
	const distCandidate = angularDistance(candidateWorld, selector);

	if (distCandidate + stickinessDeg < distSticky) return candidate;
	return stickyIndex;
}

export function snapRotationToIndex(
	itemAngles: number[],
	index: number,
	selector = SELECTOR
): number {
	return normalizeAngle(selector - itemAngles[index] + 180) - 180;
}

export function pointerAngle(
	dialRoot: HTMLElement | null,
	clientX: number,
	clientY: number
): number {
	if (!dialRoot) return 0;
	const rect = dialRoot.getBoundingClientRect();
	const radius = rect.width / 2;
	const cx = rect.left + radius;
	const cy = rect.top + radius;
	const atan2Deg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
	return 90 - atan2Deg;
}

export function centerDragBoost(
	dialRoot: HTMLElement | null,
	clientX: number,
	clientY: number
): number {
	if (!dialRoot) return 1;
	const rect = dialRoot.getBoundingClientRect();
	const radius = rect.width / 2;
	if (radius <= 0) return 1;
	const cx = rect.left + radius;
	const cy = rect.top + radius;
	const dist = Math.hypot(clientX - cx, clientY - cy);
	const threshold = radius * CENTER_BOOST_THRESHOLD;
	if (dist >= threshold) return 1;
	const t = 1 - dist / threshold;
	return 1 + (CENTER_BOOST_MAX - 1) * t;
}

type DialRotationEntry = {
	rotation: number | null;
	hasOpened: boolean;
};

/** Per-instance dial rotation survives mobile overlay unmount/remount. */
const dialRotationByInstance = new Map<string, DialRotationEntry>();

function dialRotationEntry(instanceId: string): DialRotationEntry {
	let entry = dialRotationByInstance.get(instanceId);
	if (!entry) {
		entry = { rotation: null, hasOpened: false };
		dialRotationByInstance.set(instanceId, entry);
	}
	return entry;
}

export function getSavedDialRotation(instanceId: string): number | null {
	return dialRotationEntry(instanceId).rotation;
}

export function dialHasOpenedBefore(instanceId: string): boolean {
	return dialRotationEntry(instanceId).hasOpened;
}

export function saveDialRotation(instanceId: string, rotation: number): void {
	const entry = dialRotationEntry(instanceId);
	entry.rotation = rotation;
}

export function markDialOpened(instanceId: string): void {
	dialRotationEntry(instanceId).hasOpened = true;
}

/** True when remounting should restore rotation and skip the intro snap animation. */
export function shouldRestoreDialRotation(instanceId: string): boolean {
	const entry = dialRotationEntry(instanceId);
	return entry.hasOpened && entry.rotation !== null;
}
