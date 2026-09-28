import { Icon } from '@/components/core/Icon'
import type { PageDataItem, PressItem, StaffItem, StatisticItem } from '@/types/shared'

export const STORY_TIMELINE: Required<PageDataItem>[] = [
	{
		id: 'idea-2023',
		title: '2023',
		content: 'A flash sheet taped to a studio wall sells out in an afternoon — to people bidding in the comments of a group chat. The idea writes itself.',
	},
	{
		id: 'launch-2024',
		title: '2024',
		content: 'Inkquest launches in Brooklyn with 61 artists. One rule from day one: the artist sets the floor.',
	},
	{
		id: 'market-2025',
		title: '2025',
		content: 'The marketplace opens — flash designs and open slots, bid in real time. First $1M paid out to artists.',
	},
	{
		id: 'progress-2026',
		title: '2026',
		content: '38 cities, 12,000+ artists. Still black. Still red. Still the work first.',
	},
]

export const PLATFORM_STATS: StatisticItem[] = [
	{
		id: 'artist-count',
		caption: 'Artists on platform',
		value: '12,400+',
	},
	{
		id: 'cities-reached',
		caption: 'Cities',
		value: 38,
	},
	{
		id: 'payout-total',
		caption: 'Paid to artists',
		isHighlight: true,
		value: '$9.2M',
	},
	{
		id: 'session-rating',
		caption: 'Avg session rating',
		icon: <Icon filled type="rating" />,
		value: 4.8,
	},
]

export const COMPANY_VALUES: PageDataItem[] = [
	{
		id: 'work-first',
		title: 'The work comes first',
		content: 'Search runs on portfolios, styles, and distance — never follower counts. A great tattooer with 90 followers outranks a mediocre one with 90,000.',
	},
	{
		id: 'artist-terms',
		title: 'Artists set the terms',
		content: 'Bidding starts where the artist says it starts. Floors, slots, availability — the chair belongs to the person holding the machine.',
	},
	{
		id: 'verification-process',
		title: 'Trust is earned in ink',
		content: 'Verification is manual. Reviews come only from completed sessions. A ★4.9 on Inkquest means 4.9 in real skin.',
	},
	{
		id: 'validation-guarantee',
		title: 'Skin is permanent. We act like it.',
		content: 'No dark patterns, no rushed bookings. Deposits, consults, and cancellation terms are stated up front, every time.',
	},
]

export const TEAM_MEMBERS: StaffItem[] = [
	{
		id: 'ceo-ren',
		name: 'Ren Okafor',
		role: ['Co-founder', 'CEO'],
	},
	{
		id: 'founder-june',
		name: 'June Park',
		role: ['Co-founder', 'Design'],
	},
	{
		id: 'engineer-june',
		name: 'Marisol Deng',
		role: ['Engineering'],
	},
	{
		id: 'pr-tomas',
		name: 'Tomás Reyes',
		role: ['Artist relations'],
	},
	{
		id: 'compliance-priya',
		name: 'Priya Nair',
		role: ['Trust & safety'],
	},
	{
		id: 'community-priya',
		name: 'Effie Stone',
		role: ['Community'],
	},
]

export const PRESS_QUOTES: PressItem[] = [
	{
		id: 'ledger',
		author: 'The Ledger',
		title: 'The rare marketplace that tilts the economics toward the artist.',
	},
	{
		id: 'canvas-weekly',
		author: 'Canvas Weekly',
		title: 'Part gallery, part auction house — all conviction.',
	},
	{
		id: 'ink-review',
		author: 'Ink Review',
		title: 'Finding the right artist finally feels like crate-digging, in the best way.',
	},
]
