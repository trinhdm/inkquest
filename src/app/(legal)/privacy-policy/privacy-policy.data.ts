import type { LegalSection, VersionGroup } from '../legal.types'

export const VERSION_HISTORY: VersionGroup[] = [
	{
		version: '3.2',
		date: {
			month: 'June',
			day: 12,
			year: 2026,
		},
		note: 'Clarified data retention periods for closed accounts; added CCPA appeal process.',
	},
	{
		version: '3.1',
		date: {
			month: 'September',
			day: 3,
			year: 2025,
		},
		note: 'Added section on AI-assisted style matching and how quiz responses are processed.',
	},
	{
		version: '3.0',
		date: {
			month: 'February',
			day: 28,
			year: 2024,
		},
		note: 'Full rewrite for marketplace launch; new payment-processor disclosures.',
	},
]

export const PRIVACY_SECTIONS: LegalSection[] = [
	{
		id: 'intro',
		body: [
			{ p: 'This Privacy Policy explains how Inkquest, Inc. ("Inkquest", "we", "us") collects, uses, and shares information about you when you use our websites, mobile applications, and related services (collectively, the "Services"). By using the Services you agree to the practices described here.' },
		],
	},
	{
		id: 'information-we-collect',
		title: 'Information we collect',
		summary: 'We collect what you give us (profile, portfolio, messages, payment details), what your device tells us (logs, cookies), and what partners share (payment processors, social sign-in).',
		body: [
			{ p: 'We collect information you provide directly: account registration details (name, email address, date of birth), profile and portfolio content, style-quiz responses, messages you exchange with artists or collectors, bids and purchase history, and any information you submit when contacting support.' },
			{ p: 'We also collect information automatically when you use the Services, including device identifiers, IP address, browser type, pages viewed, referring URLs, and interactions with listings. Some of this is collected through cookies and similar technologies described in our Cookie Policy.' },
			{ list: ['Payment information is collected and processed by our payment partners; Inkquest never stores full card numbers.', 'If you sign in with a third-party service (Apple, Google), we receive your name, email, and profile image as permitted by that service.', 'Artists undergoing verification provide government ID and studio licensing documents, which are processed by our identity-verification partner.'] },
		],
	},
	{
		id: 'how-we-use-information',
		title: 'How we use information',
		summary: 'We use your data to run the marketplace, match you with artists, keep the platform safe, and — with consent — send you marketing.',
		body: [
			{ p: 'We use the information we collect to operate and improve the Services: to create and maintain your account, facilitate bids and commissions, process payments, recommend artists and work aligned with your stated style preferences, and provide customer support.' },
			{ p: 'We also use information to protect the community — detecting fraud, enforcing our Community Guidelines, and verifying artist credentials — and to comply with legal obligations such as tax reporting for artist payouts.' },
			{ p: 'Where you have opted in, we send marketing communications about new artists, drops, and events. You can withdraw consent at any time from Settings or the unsubscribe link in any email.' },
		],
	},
	{
		id: 'sharing-and-disclosure',
		title: 'Sharing and disclosure',
		summary: 'We share data with service providers, with artists/collectors you transact with, and when the law requires. We never sell your personal data.',
		body: [
			{ p: 'We do not sell your personal information. We share it only in limited circumstances: with service providers who process data on our behalf (hosting, payments, identity verification, analytics) under contractual confidentiality obligations; with the counterparty to a transaction (an artist sees the name and brief of a collector who commissions them); and with law enforcement or regulators when required by a valid legal process.' },
			{ p: 'If Inkquest is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you before your data becomes subject to a different privacy policy.' },
		],
	},
	{
		id: 'your-rights',
		title: 'Your rights and choices',
		summary: 'You can access, correct, export, or delete your data, and object to certain processing. Requests are honored within 30 days.',
		body: [
			{ p: 'Depending on where you live, you may have the right to access, correct, delete, or receive a portable copy of your personal data, and to object to or restrict certain processing. You can exercise most of these rights directly from Settings → Privacy; anything else, contact our DPO using the details at the end of this document.' },
			{ p: 'We respond to verified requests within 30 days. If we deny a request, you may appeal by replying to our decision email; appeals are reviewed by a team member not involved in the original decision. Residents of the EEA and UK may also lodge a complaint with their supervisory authority.' },
		],
	},
	{
		id: 'data-retention',
		title: 'Data retention',
		summary: 'We keep data only as long as needed. Closed accounts are erased within 90 days, except records we must keep by law.',
		body: [
			{ p: 'We retain personal data for as long as your account is active or as needed to provide the Services. When you close your account, we delete or anonymize your personal data within 90 days, except where retention is required for legal, tax, or dispute-resolution purposes — transaction records, for example, are retained for seven years to satisfy financial regulations.' },
		],
	},
]
