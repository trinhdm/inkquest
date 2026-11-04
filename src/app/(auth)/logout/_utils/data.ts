import { getAuthFormIDs } from '../../_utils/helpers'
import type { LogoutPageData } from './types'

export const IDX = getAuthFormIDs('logout', 'done')

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
