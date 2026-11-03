import type { BasePageData } from '@/types/shared'

export interface LogoutPageData
	extends BasePageData {}

export const LOGOUT_PAGE_DATA: LogoutPageData = {
	id: 'logout',
	title: 'Logout',
	description: `You're signed out.`,
	hero: {
		id: 'hero',
		eyebrow: 'Log Out',
		heading: `You've been signed out.`,
		body: `Your account is safe. Log back in whenever you're ready.`,
	},
}
