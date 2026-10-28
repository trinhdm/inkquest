import type { BasePageData } from '@/types/shared'

export const PASSWORD_RULES = [
	{
		id: 'length',
		label: '8+ characters',
		need: 'at least 8 characters',
		test: (value: string) => value.length >= 8,
	},
	{
		id: 'case',
		label: 'Upper & lower case',
		need: 'upper and lower case letters',
		test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
	},
	{
		id: 'number',
		label: 'A number',
		need: 'a number',
		test: (value: string) => /\d/.test(value),
	},
	{
		id: 'symbol',
		label: 'A symbol',
		need: 'a symbol',
		test: (value: string) => /[^A-Za-z0-9]/.test(value),
	},
] as const

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
