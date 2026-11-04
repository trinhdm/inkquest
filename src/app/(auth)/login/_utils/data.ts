import type { BasePageData } from '@/types/shared'

export interface LoginPageData
	extends BasePageData {}

export const LOGIN_PAGE_DATA: LoginPageData = {
	id: 'login',
	title: 'Login',
	description: 'Login to your Inkquest account.',
	hero: {
		id: 'hero',
		eyebrow: 'Log In',
		heading: 'Welcome back.',
		body: 'Pick up where you left off.',
	},
}
