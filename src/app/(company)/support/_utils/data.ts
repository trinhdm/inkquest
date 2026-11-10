import { NavRoutes } from '@/utils/navigation'
import type { ArtistSupportTopic, ClientSupportTopic } from './types'
import type { BasePageData } from '@/types/shared'

export const EMAIL_GROUPS = [
	{
		id: 'support',
		recipient: 'Support',
		email: 'support@inkquest.com',
	},
	{
		id: 'safety',
		recipient: 'Trust & Safety',
		email: 'safety@inkquest.com',
	},
	{
		id: 'press',
		recipient: 'Press',
		email: 'press@inkquest.com',
	},
	{
		id: 'partners',
		recipient: 'Partnerships',
		email: 'partners@inkquest.com',
	},
]

export const CLIENT_SUPPORT: readonly ClientSupportTopic[] = [
	{
		value: 'general',
		label: 'General Support',
		caption: 'Account, app issues, anything else.',
	},
	{
		value: 'booking',
		label: 'Booking',
		caption: 'A bid, deposit, or session that needs a human.',
	},
	{
		value: 'payments',
		label: 'Payments',
		caption: 'Deposits, escrow, payout timing.',
	},
]

export const ARTIST_SUPPORT: readonly ArtistSupportTopic[] = [
	{
		value: 'general',
		label: 'General Support',
		caption: 'Account, app issues, anything else.',
	},
	{
		value: 'payments',
		label: 'Payments & payouts',
		caption: 'Deposits, escrow, payout timing.',
	},
	{
		value: 'verification',
		label: 'Verification',
		caption: 'Getting or keeping the VERIFIED badge.',
	},
	{
		value: 'press',
		label: 'Press & media',
		caption: 'Interviews, assets, embargoed things.',
	},
	{
		value: 'safety',
		label: 'Trust & Safety',
		caption: 'Report a session, artist, or listing. Read by a human, fast.',
	},
	{
		value: 'partnerships',
		label: 'Partnerships',
		caption: 'Conventions, suppliers, integrations.',
	},
]

export interface SupportPageData
	extends BasePageData {}

export const SUPPORT_PAGE_DATA = {
	id: 'support',
	title: 'Support',
	description: 'Support Center',
	hero: {
		id: 'hero',
		eyebrow: 'Contact',
		heading: 'Talk to a human.',
		body: `Pick who you are and what it's about — we'll route it to the right person. Quick question? The <Link href=${NavRoutes.COMPANY_FAQS} data-cta>FAQs</Link> might already have it.`,
	},
}
