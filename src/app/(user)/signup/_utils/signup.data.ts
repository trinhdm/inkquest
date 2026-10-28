import type { BasePageData } from '@/types/shared'

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
		label: 'Upper & lower case',
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


const listFormat = new Intl.ListFormat('en', { type: 'conjunction' })

//	lists which password criteria is still missing
export const describeMissing = (value: string) => {
	const missing = PASSWORD_RULES.filter(rule => !rule.test(value))
	if (!missing.length) return undefined

	return `Your password needs ${listFormat.format(
		missing.map(({ label }) => label.toLowerCase())
	)}.`
}
