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
	hero: {
		id: 'hero',
		eyebrow: 'Log out',
		heading: `You've been signed out.`,
		body: `Your account is safe. Log back in whenever you're ready.`,
	},
} as const
