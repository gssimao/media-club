import {
	BookOpen,
	Clock,
	Faders,
	FilmStrip,
	Heart,
	House,
	SignIn,
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
export const NODE_R_RATIO = 0.88;
export const grooveRadii = [0.88, 0.68, 0.48] as const;
export const tickAngles = [0, 45, 90, 135, 180, 225, 270, 315] as const;
export const CENTER_BOOST_THRESHOLD = 0.45;
export const CENTER_BOOST_MAX = 1.2;
export const DIAL_SNAP_MS = 450;

const catalogItems: NavItem[] = [
	{ href: '/', label: 'Home', icon: House, match: (p) => p === '/' },
	{ href: '/movies', label: 'Movies', icon: FilmStrip, match: (p) => p.startsWith('/movies') },
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
					icon: Clock,
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
