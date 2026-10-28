import type { BasePageData } from '@/types/shared'

export interface SignupPageData
	extends BasePageData {}

export const SIGNUP_PAGE_DATA: SignupPageData = {
	id: 'signup',
	title: 'Signup',
	description: 'Signup for your own Inkquest account.',
	hero: {
		id: 'hero',
		eyebrow: 'Log In',
		heading: 'Welcome back.',
		body: 'One account for finding artists, bidding on flash, and booking.',
	},
}
