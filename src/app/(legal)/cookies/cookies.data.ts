import { COMPANY_INFO, COMPANY_NAME } from '@/utils/constants'
import type { LegalPageData } from '../_utils/legal.types'

const VERSION_HISTORY: LegalPageData['changelog'] = [
	{
		id: 'rel_001',
		version: '1.0',
		release_date: {
			month: 'June',
			day: 8,
			year: 1993,
		},
		summary: 'Published first iteration.',
	},
]

const PRIVACY_SECTIONS: LegalPageData['content'] = [
	{
		id: 'intro',
		body: [
			{ p: 'This Cookie Policy explains what cookies and similar technologies are, which ones Inkquest uses, and how you can control them. It supplements our Privacy Policy.' },
		],
	},
	{
		id: 'what-are-cookies',
		title: 'What cookies are',
		summary: 'Small files that remember you between visits. Similar tech includes local storage and pixels.',
		body: [
			{ p: 'Cookies are small text files placed on your device that allow a site to recognize your browser between visits. We also use similar technologies — local storage, session storage, and pixels — which this policy covers under the same term.' },
		],
	},
	{
		id: 'cookies-we-use',
		title: 'Cookies we use',
		summary: 'Four categories: essential (always on), preferences, analytics, and marketing (only with consent).',
		body: [
			{ list: [
				'Essential — sign-in sessions, security tokens, load balancing, and the consent manager itself. These cannot be disabled.',
				'Preferences — theme choice, saved filters, style-quiz progress, and language. Stored for up to 12 months.',
				'Analytics — anonymized usage measurement that helps us understand which features are used. Set only with your consent.',
				'Marketing — used to measure campaign effectiveness and limit repeated ads off-platform. Set only with your consent; never used to sell data.',
			] },
		],
	},
	{
		id: 'managing-cookies',
		title: 'Managing your preferences',
		summary: 'Change consent any time via Settings → Cookies. Browser controls and Global Privacy Control are honored too.',
		body: [
			{ p: 'On your first visit we ask for consent before setting any non-essential cookies. You can change your choices at any time from Settings → Cookie preferences, which reopens the consent manager. We also honor the Global Privacy Control (GPC) browser signal as an opt-out of analytics and marketing cookies.' },
			{ p: 'Most browsers let you block or delete cookies entirely; note that blocking essential cookies will prevent sign-in and checkout from working.' },
		],
	},
	{
		id: 'third-party-cookies',
		title: 'Third-party cookies',
		summary: 'A short, audited vendor list: payments, analytics, and embedded media. Each vendor is contractually limited.',
		body: [
			{ p: 'A small number of vetted partners set cookies through our Services: our payment processor (fraud prevention during checkout), our analytics provider (consent-gated usage measurement), and embedded media players on community posts. Each partner is contractually restricted from using this data for their own purposes. A current list of vendors is available in the consent manager.' },
		],
	},
	{
		id: 'retention-cookies',
		title: 'Retention',
		summary: 'Session cookies expire when you close the browser; persistent ones last 30 days to 12 months.',
		body: [
			{ p: 'Session cookies are deleted when you close your browser. Persistent cookies last between 30 days (marketing) and 12 months (preferences), after which consent is requested again. Consent records themselves are retained for five years as required by law.' },
		],
	},
	{
		id: 'changes-cookies',
		title: 'Changes to this policy',
		summary: `Vendor or category changes reopen the consent manager so you can re-decide.`,
		body: [
			{ p: 'When we add vendors or change cookie categories, we update this policy and reopen the consent manager on your next visit so you can review your choices. The version history at the top of this page records every revision.' },
		],
	},
]

export const COOKIES_DATA: LegalPageData = {
	id: 'cookies',
	title: 'Cookies',
	description: `${COMPANY_NAME} Cookies Policy.`,
	updated_date: {
		month: 'May',
		day: 1,
		year: 2000,
	},
	effective_date: {
		month: 'June',
		day: 10,
		year: 2001,
	},
	changelog: VERSION_HISTORY,
	company_info: COMPANY_INFO,
	hero: {
		id: 'hero',
		heading: 'Cookie Policy',
	},
	content: PRIVACY_SECTIONS,
	footer: {
		id: 'footer',
		heading: 'Cookie questions',
		body: 'For questions about our use of cookies or to exercise related rights, contact our privacy team.',
		recipient: 'Attn: DPO',
		contact_email: 'privacy@inkquest.com',
	},
}
