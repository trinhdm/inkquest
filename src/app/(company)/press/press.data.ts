import type { AssetItem, PressItem, StatisticItem } from '@/types/shared'

export const COMPANY_STATS: StatisticItem[] = [
	{
		id: 'artist-count',
		caption: 'Founded',
		value: '2024, Brooklyn NY',
	},
	{
		id: 'cities-reached',
		caption: 'Artists',
		value: '12,400+ across 38 cities',
	},
	{
		id: 'payout-total',
		caption: 'Paid to artists',
		value: '$9.2M to date',
	},
	{
		id: 'session-rating',
		caption: 'Model',
		value: 'Clients bid; artists set the floor',
	},
]

export const ASSETS_LIST: AssetItem[] = [
	{
		id: 'logo-pack',
		title: 'Logo pack',
		content: 'SVG + PNG, dark and light lockups',
		attachment: {
			url: 'https://react.dev/',
			size: '1.2 mb',
			type: 'zip',
		},
	},
	{
		id: 'product-screenshots',
		title: 'Product screenshots',
		content: 'Discover, marketplace, bidding flow',
		attachment: {
			url: '/',
			size: '8.4 mb',
			type: 'zip',
		},
	},
	{
		id: 'founder-photos',
		title: 'Founder photos',
		content: 'Ren Okafor & June Park, print-res',
		attachment: {
			url: 'https://www.npmjs.com/',
			size: '14 mb',
			type: 'zip',
		},
	},
	{
		id: 'brand-guidelines',
		title: 'Brand guidelines',
		content: 'Color, type, and usage rules',
		attachment: {
			url: 'https://claude.ai/',
			size: '2.1 mb',
			type: 'pdf',
		},
	},
]

export const PRESS_HISTORY: PressItem[] = [
	{
		id: 'verge-article',
		author: 'The Verge',
		title: 'How Inkquest is rewiring the way tattoo artists get booked',
		url: '/',
		publishDate: {
			month: 'March',
			year: 2026,
		},
	},
	{
		id: 'fast-company-article',
		author: 'Fast Company',
		title: 'The startup letting tattoo artists set their own floor price',
		url: 'https://react.dev/',
		publishDate: {
			month: 'January',
			year: 2026,
		},
	},
	{
		id: 'techcrunch-article',
		author: 'TechCrunch',
		title: 'Inkquest raises to expand its artist-first marketplace',
		url: '/about',
		publishDate: {
			month: 'September',
			year: 2025,
		},
	},
	{
		id: 'hyperallergic-article',
		author: 'Hyperallergic',
		title: 'Inside the app turning flash sheets into live auctions',
		url: 'https://www.npmjs.com/',
		publishDate: {
			month: 'July',
			year: 2025,
		},
	},
	{
		id: 'wired-article',
		author: 'Wired',
		title: 'Bidding for body art: the new economics of tattooing',
		url: '/careers',
		publishDate: {
			month: 'May',
			year: 2025,
		},
	},
]
