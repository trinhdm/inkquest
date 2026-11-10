import { NavRoutes } from '@/utils/navigation'
import type { AuthContinue } from '../../_components/_parts'
import type { LogoutPageData } from './types'

export const SHARED_CONTINUE_PROPS = {
	href: NavRoutes.HOME,
	label: 'Back to home',
	linkable: true,
} satisfies AuthContinue.Props

export const LOGOUT_PAGE_DATA: LogoutPageData = {
	id: 'logout',
	title: 'Log out',
	description: 'Log out of your Inkquest account.',
	form: {
		confirm: {
			id: 'confirm-logout',
			eyebrow: 'Confirm',
			heading: `Log out of Inkquest?`,
			body: `You're still logged in on this browser.`,
		},
		finish: {
			id: 'finish-logout',
			eyebrow: 'Logged out',
			heading: `You're signed out.`,
			body: `Your account is safe. Log back in whenever you're ready.`,
		},
	},
}
