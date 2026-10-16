import type {
	BasePageData, ContentData,
	JobItem, PageDataItem,
} from '@/types/shared'

const CULTURE_PILLARS: PageDataItem[] = [
	{
		id: 'goals',
		title: 'Craft over volume',
		content: 'We ship less, better. Nobody is measured on output theater.',
	},
	{
		id: 'expectations',
		title: 'Skin in the game',
		content: 'Everyone talks to artists and clients — support shifts included, founders too.',
	},
	{
		id: 'benefits',
		title: 'Honest terms',
		content: 'Salary bands published internally. Equity for every role. No surprise re-orgs.',
	},
]

const OPEN_POSITIONS: JobItem[] = [
	{
		id: 'senior-product-engineer',
		title: 'Senior Product Engineer',
		content: 'Build the surfaces where artists list work and clients book it — from the marketplace and auction flows to the tools artists use to run their books.',
		department: {
			name: 'engineering',
			code: 'dark',
		},
		location: 'remote',
		url: '/about',
	},
	{
		id: 'artist-relations-lead',
		title: 'Artist Relations Lead',
		content: 'Own the relationship with the artists on the platform — onboarding, education, pricing guidance, and being their advocate in every product decision we make.',
		department: {
			name: 'artist relations',
			code: 'neutral',
		},
		location: 'San Francisco, CA',
		url: '/community/events',
	},
	{
		id: 'community-manager',
		title: 'Community Manager',
		content: 'Run the programs that keep the Inkquest community healthy — the feed, events, spotlights, and the day-to-day relationships with the artists and collectors who show up.',
		department: {
			name: 'community',
			code: 'info',
		},
		location: 'Brooklyn, NY',
		url: '/community',
	},
]

const HIRING_STEPS: PageDataItem[] = [
	{
		id: 'application',
		title: 'Apply',
		content: 'A short form and your work. No cover letter — show us what you make.',
	},
	{
		id: 'interview',
		title: 'Talk',
		content: 'Two conversations: one about craft, one with the people you would work with.',
	},
	{
		id: 'assignment',
		title: 'Work session',
		content: 'A paid, scoped exercise close to the real job. Never spec work.',
	},
	{
		id: 'decision',
		title: 'Offer',
		content: 'Decision within a week of the work session. We tell you either way.',
	},
]

export type CareersContent =
	ContentData<PageDataItem[]>

export type CareersSection =
	| ContentData<PageDataItem[], 'culture'>
	| ContentData<JobItem[], 'listings'>
	| ContentData<PageDataItem[], 'process'>

export interface CareersPageData
	extends BasePageData {
	content?: CareersSection[]
}

export const CAREERS_PAGE_DATA: CareersPageData = {
	id: 'careers',
	title: 'Careers',
	description: `We're a team building the place where tattoo work gets found, priced, and booked on the artist's terms.`,
	hero: {
		id: 'hero',
		eyebrow: 'Careers · Brooklyn + remote',
		heading: 'Small crew, sharp needles.',
		body: `We're a team of fourteen building the place where tattoo work gets found, priced, and booked on the artist's terms. Half of us are tattooed. All of us ship.`
	},
	content: [
		{
			id: 'culture',
			body: CULTURE_PILLARS,
		},
		{
			id: 'listings',
			heading: 'Join the crew.',
			eyebrow: 'Open roles',
			body: OPEN_POSITIONS,
			buttons: [
				{
					id: 'btn_listings',
					label: 'See all roles',
					url: '/careers',
					variant: 'outline',
				},
			],
		},
		{
			id: 'process',
			heading: 'Four steps. No mazes.',
			eyebrow: 'How hiring works',
			body: HIRING_STEPS,
		},
	],
}
