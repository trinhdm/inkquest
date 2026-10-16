import type { Field } from '@/components/form/Field'
import type { BasePageData, PageDataItem } from '@/types/shared'

export interface FaqGroup {
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
		questions: [
			{
				id: 'artist-verification-process',
				title: 'How do I get verified?',
				content: `Submit your portfolio, studio affiliation, and local licensing details from your profile settings. Our team reviews every application by hand — most are approved within 3 business days. Verified artists get the VERIFIED badge, priority placement in search, and access to bidding.`,
			},
			{
				id: 'add-design-slot',
				title: 'How do I post a flash design or open slot?',
				content: `From your dashboard, choose New listing → Flash design or Open slot. Upload the artwork or set the date range, write a short description, set your floor price and deposit, and choose how long bidding stays open. Listings go live immediately and appear in search and your followers' feeds.`,
			},
			{
				id: 'payout-process',
				title: 'How and when do I get paid?',
				content: `Deposits are paid out to your linked bank account 24 hours after the booking is confirmed. Session balances you collect in-studio are yours directly — Inkquest only processes the deposit. Payouts run daily; standard transfers take 1–2 business days.`,
			},
			{
				id: 'listing-minimum-price',
				title: 'Can I set a minimum price?',
				content: `Always. Every listing starts at the floor you set — bids below it aren't possible. You can also set a Buy-now price that ends bidding instantly when someone meets it.`,
			},
			{
				id: 'bid-choice',
				title: 'Do I have to accept the highest bid?',
				content: `No. The chair is yours. You can accept any bid — or none — based on the client's idea, placement, references, or anything else. Declining all bids closes the listing with no fee.`,
			},
			{
				id: 'platform-fees',
				title: 'What fees does Inkquest take?',
				content: `A flat 8% service fee on the accepted bid amount, deducted from the deposit payout. No listing fees, no subscription, no charge for declined or expired listings.`,
			},
		],
	},
	{
		id: 'studio-faqs',
		category: 'For studios',
		questions: [
			// {
			// 	id: 'sharing-studio-profile',
			// 	title: 'Can a studio have a shared profile?',
			// 	content: `Yes. Studio profiles group your resident artists under one roof — shared portfolio, location, hours, and booking policies — while each artist keeps their own profile, listings, and reviews.`,
			// },
			{
				id: 'add-studio-artists',
				title: 'How do I add artists to my studio?',
				content: `From your studio dashboard, send an invite to the artist's Inkquest account. Once they accept, their profile shows your studio affiliation and their work appears in your studio's shared portfolio. Artists can belong to one studio at a time.`,
			},
			{
				id: 'add-guest-spots',
				title: 'Can studios post guest spots?',
				content: `Yes — post a guest spot listing with the dates and the visiting artist's profile. Guest artists keep their own reviews and payouts; the listing appears in both the studio's page and local search for the duration of the visit.`,
			},
			{
				id: 'studio-verification-process',
				title: 'How does studio verification differ from artist verification?',
				content: `Studio verification covers the business: health department licensing, premises, and insurance, reviewed by our team. It doesn't replace individual artist verification — each resident artist still verifies separately. A fully verified studio (business + all residents) earns the STUDIO VERIFIED badge.`,
			},
		],
	},
	{
		id: 'payment-faqs',
		category: 'Bidding & payments',
		questions: [
			{
				id: 'payment-security',
				title: 'Is my payment information secure?',
				content: `Yes. Payments are processed by our PCI-DSS-certified payment partner — card details never touch Inkquest's servers. Deposits are held in escrow until the booking is confirmed by both sides.`,
			},
		],
	},
	{
		id: 'safety-faqs',
		category: 'Trust & safety',
		questions: [
			{
				id: 'health-standards',
				title: 'How do you handle health and hygiene standards?',
				content: `Every verified artist and studio must hold current local health licensing, which we check at verification and re-check annually. Reviews flag hygiene concerns to our Trust & Safety team automatically, and credible reports trigger an immediate re-review.`,
			},
		],
	},
	{
		id: 'misc-faqs',
		category: 'Misc',
		questions: [],
	},
]

export interface FaqsPageData
	extends BasePageData {
	items: FaqGroup[]
	search: {
		field: Field.Input.Props
		empty: string
		error: string
	}
}

export const FAQS_PAGE_DATA: FaqsPageData = {
	id: 'faqs',
	title: 'FAQs',
	items: FAQ_ITEMS,
	search: {
		field: {
			name: 'faq-search',
			placeholder: 'Search all FAQs…',
		},
		empty: 'Nothing here yet. Check back soon.',
		error: `Try a different word, or <a href="/messages">ask us</a> directly and we'll answer.`,
	},
	hero: {
		eyebrow: 'Company · FAQs',
		heading: 'Questions, answered.',
		body: `Everything about bidding, booking, verification, and payouts — for clients, artists, and studios. Can't find it? <a href="/messages">Message us</a>.`
	},
	footer: {
		eyebrow: 'Still need help?',
		heading: 'Ask a human.',
		body: 'Our support team answers within a day — usually much faster. For booking disputes or safety concerns, head straight to the Support page.',
		buttons: [
			{
				id: 'btn_ticket',
				label: 'Open ticket',
				url: '/careers',
			},
			{
				id: 'btn_email',
				label: 'Email support',
				url: '/careers',
			},
		],
	},
}
