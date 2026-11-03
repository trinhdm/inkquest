import type { BasePageData } from '@/types/shared'

//	mock: there are no sessions yet, so the signed-in account is hard-coded
export const MOCK_ACCOUNT = {
	email: 'scout.finch@gmail.com',
	name: 'Scout Finch',
}

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
