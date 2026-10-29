import type { BasePageData } from '@/types/shared'

export const SIGNUP_METHODS = ['email', 'magic', 'phone'] as const

export const CODE_EXPIRY_SECONDS = 10 * 60
export const RESEND_COOLDOWN_SECONDS = 30

interface PasswordCriteria {
	id: string
	label: string
	test: (value: string) => boolean
}

export const PASSWORD_RULES: PasswordCriteria[] = [
	{
		id: 'length',
		label: '6+ characters',
		test: (value: string) => value.length >= 6,
	},
	{
		id: 'case',
		label: 'Upper & lower case letters',
		test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
	},
	{
		id: 'number',
		label: 'A number',
		test: (value: string) => /\d/.test(value),
	},
	{
		id: 'symbol',
		label: 'A symbol',
		test: (value: string) => /[^A-Za-z0-9]/.test(value),
	},
	// {
	// 	id: 'uppercase',
	// 	label: 'One uppercase letter (A-Z)',
	// 	test: (value: string) => /[A-Z]/.test(value),
	// },
	// {
	// 	id: 'lowercase',
	// 	label: 'One lowercase letter (a-z)',
	// 	test: (value: string) => /[a-z]/.test(value),
	// },
] as const

export interface SignupPageData
	extends BasePageData {}

export const SIGNUP_PAGE_DATA: SignupPageData = {
	id: 'signup',
	title: 'Sign Up',
	description: 'Create your own Inkquest account.',
	hero: {
		id: 'hero',
		eyebrow: 'Sign Up',
		heading: 'Join Inkquest.',
		body: 'One account for finding artists, bidding on flash, and booking.',
	},
}
