import type { PageDataItem } from '@/types/shared'
import type { Sidebar } from '@/components/layout'

interface FaqGroup {
	id: string
	category: string
	questions: PageDataItem[]
}

export const FAQ_ITEMS: FaqGroup[] = [
	{
		id: 'general-faqs',
		category: 'General',
		questions: [
			{
				id: 'general-about-iq',
				title: 'What is Inkquest?',
				content: `Inkquest is a marketplace and community for tattoos. Clients search artists by style and distance, browse portfolios, and bid on flash designs or open appointment slots. Artists post the work, set the terms, and choose who sits in the chair.`,
			},
			{
				id: 'general-pricing',
				title: 'How much does it cost to use?',
				content: `Browsing, searching, and following artists is free for everyone. Clients pay nothing to place bids — you're only charged when an artist accepts your offer. Artists pay a flat 8% service fee on completed bookings; there are no listing fees or subscriptions.`,
			},
			{
				id: 'general-browse-as-guest',
				title: 'Do I need an account to browse?',
				content: `No. Portfolios, flash listings, and the community feed are open to everyone. You'll need a free account to place bids, message artists, save work to your circle, or leave reviews.`,
			},
			{
				id: 'general-company-location',
				title: 'Which cities is Inkquest in?',
				content: `We're live in 38 cities across North America and Europe, with more opening every quarter. Search by your location on the Discover page — if we're not in your city yet, join the waitlist and we'll email you the day we launch there.`,
			},
			{
				id: 'general-compare-instagram',
				title: 'How is this different from DMing an artist on Instagram?',
				content: `No cold DMs, no follower math. Search runs on portfolios, styles, and distance — never audience size. Pricing, deposits, and cancellation terms are stated up front, and every review comes from a completed session. It's the parts of finding an artist that Instagram was never built for.`,
			},
		],
	},
	{
		id: 'client-faqs',
		category: 'For clients',
		questions: [
			{
				id: 'client-bidding',
				title: 'How does bidding work?',
				content: `Artists post a flash design or an open appointment slot with a starting floor. You place the offer you're willing to pay; other clients can bid too. When the listing closes, the artist accepts the winning offer — usually the highest bid, but artists can choose based on fit. You'll be notified the moment you're leading, outbid, or accepted.`,
			},
			{
				id: 'client-auction-win',
				title: 'What happens after I win a bid?',
				content: `You'll pay the deposit stated on the listing (it counts toward your total), and a message thread opens with the artist to confirm the date, placement, and any reference details. The remaining balance is settled at the studio after your session.`,
			},
			{
				id: 'client-book-slot',
				title: 'Can I book without bidding?',
				content: `Yes. Many artists offer direct booking on open slots at a fixed price — look for listings marked BOOK NOW instead of OPEN BID. You can also message any artist to request a custom piece.`,
			},
			{
				id: 'client-manage-slot',
				title: 'How are deposits and cancellations handled?',
				content: `Each artist sets their own deposit amount and cancellation window, shown on every listing before you bid. As a rule: cancel outside the window and your deposit is refunded in full; inside the window, the deposit goes to the artist for the held time. No surprises — the terms you saw when you bid are the terms that apply.`,
			},
			{
				id: 'client-reviews',
				title: 'How do reviews work?',
				content: `Only clients who completed a session through Inkquest can leave a review, and reviews can't be paid for or removed by artists. That's why a ★4.9 here means 4.9 in real skin.`,
			},
		],
	},
	{
		id: 'artist-faqs',
		category: 'For artists',
		questions: [],
	},
	{
		id: 'studio-faqs',
		category: 'For studios',
		questions: [],
	},
	{
		id: 'payment-faqs',
		category: 'Bidding & payments',
		questions: [],
	},
	{
		id: 'safety-faqs',
		category: 'Trust & safety',
		questions: [],
	},
	{
		id: 'misc-faqs',
		category: 'Misc',
		questions: [],
	},
]

export const FAQ_CATEGORIES: Sidebar.LinkItem[] = FAQ_ITEMS.map(({ category, id }) => ({
	id,
	label: category,
	url: `/faqs?category=${id}`,
}))

export const resolveFaqGroup = (value?: string | string[]): FaqGroup => {
	const id = Array.isArray(value) ? value[0] : value
	return FAQ_ITEMS.find(group => group.id === id) ?? FAQ_ITEMS[0]
}
