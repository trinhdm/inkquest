import { COMPANY_INFO } from '@/utils/constants'
import type { LegalPageData } from '../_utils/legal.types'

const VERSION_HISTORY: LegalPageData['changelog'] = [
	{
		id: 'rel_454',
		version: '4.1',
		release_date: {
			month: 'February',
			day: 28,
			year: 2012,
		},
		summary: 'Updated dispute-resolution venue; clarified commission cancellation windows.',
	},
	{
		id: 'rel_453',
		version: '4.0',
		release_date: {
			month: 'April',
			day: 30,
			year: 2011,
		},
		summary: 'Added bidding and escrow terms for the marketplace.',
	},
]

const TERMS_SECTIONS: LegalPageData['sections'] = [
	{
		id: 'intro',
		body: [
			{ p: 'These Terms of Service ("Terms") govern your access to and use of Inkquest. Please read them carefully — they include limitations on liability and a binding arbitration clause. If you do not agree to these Terms, do not use the Services.' },
		],
	},
	{
		id: 'eligibility',
		title: 'Eligibility and accounts',
		summary: 'You must be 18+, provide accurate information, and keep your credentials secure. One account per person.',
		body: [
			{ p: 'You must be at least 18 years old to use Inkquest. By creating an account you represent that the information you provide is accurate and that you will keep it current. You are responsible for all activity under your account and for maintaining the confidentiality of your credentials. Each person may maintain only one collector account; verified artists may additionally operate one studio account.' },
		] ,
	},
	{
		id: 'marketplace-terms',
		title: 'Marketplace, bidding, and commissions',
		summary: 'Bids are binding. Funds sit in escrow until you approve the final design. Cancellation windows depend on the project stage.',
		body: [
			{ p: 'When you place a bid on a listing or accept an artist\u2019s commission quote, you enter a binding agreement to purchase at that price. Funds are charged when the artist accepts and held in escrow until you approve the delivered design or the appointment is completed.' },
			{ list: [
				'Collectors may cancel without penalty within 24 hours of acceptance, or any time before the artist begins work.',
				'After work begins, cancellations forfeit the deposit portion (25%) of the escrow.',
				'Artists who cancel an accepted commission must refund the full escrow and may have their marketplace standing reduced.',
			] },
			{ p: 'Inkquest is a venue: the contract for tattoo services or artwork is between the collector and the artist. We do not guarantee the quality, safety, or legality of services offered, though we require verification and enforce our Community Guidelines.' },
		],
	},
	{
		id: 'sharing-and-disclosure',
		title: 'Fees and payments',
		summary: 'Inkquest charges artists a 12% marketplace fee. Collectors pay the listed price plus payment-processing costs shown at checkout.',
		body: [
			{ p: 'Inkquest charges artists a marketplace fee of 12% of each completed transaction, deducted from the payout. Collectors pay the price shown at checkout, which includes any applicable payment-processing costs and taxes. Payouts to artists are issued within five business days of transaction completion via our payment partner.' },
		],
	},
	{
		id: 'content-and-ip',
		title: 'Content and intellectual property',
		summary: 'Artists keep ownership of their work. You grant Inkquest a license to display what you upload. Don\u2019t upload work that isn\u2019t yours.',
		body: [
			{ p: 'Artists retain all rights to the designs and images they upload. By posting content you grant Inkquest a non-exclusive, worldwide, royalty-free license to host, display, and promote that content within the Services and in Inkquest marketing that features the platform. This license ends when you delete the content, except where it has been shared with others who have not deleted it.' },
			{ p: 'You may not upload content you do not own or lack permission to use. We respond to takedown notices under the DMCA; repeat infringers will have their accounts terminated.' },
		],
	},
	{
		id: 'prohibited-conduct',
		title: 'Prohibited conduct',
		summary: 'No fee circumvention, no fake bids, no harassment, no scraping. Violations can end your account.',
		body: [
			{ list: [
				'Circumventing marketplace fees by moving transactions off-platform after connecting through Inkquest.',
				'Placing bids without intent to pay, shill bidding, or manipulating listing visibility.',
				'Harassment, hate speech, or any conduct prohibited by our Community Guidelines.',
				'Scraping, reverse engineering, or accessing the Services by automated means without written permission.',
				'Misrepresenting verification status, licensing, or health and safety compliance.',
			] },
		],
	},
	{
		id: 'disclaimers-liability',
		title: 'Disclaimers and limitation of liability',
		summary: 'The Services are provided "as is". Our total liability is capped at the greater of $100 or what you paid us in the last 12 months.',
		body: [
			{ p: 'THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, INKQUEST\u2019S AGGREGATE LIABILITY ARISING OUT OF THESE TERMS WILL NOT EXCEED THE GREATER OF ONE HUNDRED U.S. DOLLARS OR THE AMOUNTS YOU PAID TO INKQUEST IN THE TWELVE MONTHS PRECEDING THE CLAIM. Some jurisdictions do not allow these limitations, so they may not apply to you.' },
		],
	},
	{
		id: 'disputes',
		title: 'Dispute resolution and arbitration',
		summary: 'Most disputes go to binding individual arbitration in San Francisco. You can opt out within 30 days of accepting these Terms.',
		body: [
			{ p: 'Except for small-claims matters and injunctive relief for IP violations, any dispute arising from these Terms will be resolved by binding individual arbitration administered by JAMS in San Francisco, California. Class actions are waived. You may opt out of arbitration by emailing legal@inkquest.com within 30 days of first accepting these Terms.' },
		],
	},
	{
		id: 'changes-terms',
		title: 'Changes and termination',
		summary: 'We may update these Terms with 30 days\u2019 notice. You can close your account at any time; some sections survive termination.',
		body: [
			{ p: 'We may modify these Terms with at least 30 days\u2019 notice for material changes; continued use after the effective date constitutes acceptance. You may terminate your account at any time from Settings. Sections concerning content licenses, fees owed, disclaimers, and dispute resolution survive termination.' },
		]
	},
]

export const TERMS_PAGE_DATA: LegalPageData = {
	id: 'terms',
	title: 'Terms',
	updated_date: {
		month: 'October',
		day: 13,
		year: 2026,
	},
	effective_date: {
		month: 'October',
		day: 13,
		year: 2026,
	},
	changelog: VERSION_HISTORY,
	company_info: COMPANY_INFO,
	hero: { heading: 'Terms of Service' },
	sections: TERMS_SECTIONS,
	footer: {
		heading: 'Questions about these Terms',
		body: 'Our legal team can clarify anything in this agreement before you accept it.',
		recipient: 'Legal Department',
		contact_email: 'legal@inkquest.com',
	},
}
