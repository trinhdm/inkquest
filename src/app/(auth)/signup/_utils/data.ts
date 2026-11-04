import { syncLengthTo } from '@/utils/helpers'
import type { CSSProperties } from 'react'

import type {
	MethodData, PasswordRule,
	SignupMethod, SignupPageData,
} from './types'

//	otp code

export const CODE_LENGTH = 6

//	password meter

export const SKIP_GAP = 2
export const TIER_MS = 75
export const METER_CSS = { '--pw-tier-duration': `${TIER_MS}ms` } as CSSProperties

//	signup methods

export const SIGNUP_METHODS = ['email', 'magic', 'phone'] as const
export const METHOD_BASE: SignupMethod = 'email'

const EMAIL_DATA =  {
	copy: {
		input: 'email',
		output: 'email',
	},
	field: {
		label: 'Email',
		type: 'email',
	},
} as const satisfies Pick<MethodData, 'copy' | 'field'>

export const METHOD_DATA = {
	email: {
		...EMAIL_DATA,
		toggle: {
			icon: 'email',
			label: 'Use email & password',
		},
		verify: {
			submit: 'Create account',
			type: 'code',
		},
	},
	magic: {
		...EMAIL_DATA,
		toggle: {
			icon: 'wand-sparkles',
			label: 'Email me a magic link',
		},
		verify: {
			submit: 'Send magic link',
			type: 'link',
		},
	},
	phone: {
		copy: {
			input: 'number',
			output: 'texts',
		},
		field: {
			label: 'Phone Number',
			type: 'tel',
		},
		toggle: {
			icon: 'phone',
			label: 'Use phone number',
		},
		verify: {
			submit: 'Send code',
			type: 'code',
		},
	},
} as const satisfies Record<SignupMethod, MethodData>

//	password requirements

export const PASSWORD_MIN_LENGTH = 6
export const SEQUENCE_CHECK_MIN = 4

export const PASSWORD_RULES = [
	{
		id: 'length',
		label: `${PASSWORD_MIN_LENGTH}+ characters`,
		error: `at least ${PASSWORD_MIN_LENGTH} characters`,
		test: (value: string) => value.length >= PASSWORD_MIN_LENGTH,
	},
	{
		id: 'nonsequential',
		label: `No sequences (e.g., "abc")`,
		error: 'no sequential characters',
		test: (value: string) => {
			if (value.length < SEQUENCE_CHECK_MIN) return false
			for (let i = 0; i < value.length - 2; i++) {
				const c1 = value.charCodeAt(i),
					c2 = value.charCodeAt(i + 1),
					c3 = value.charCodeAt(i + 2)
				if (c2 === c1 + 1 && c3 === c2 + 1) return false
			}
			return true
		},
	},
	{
		id: 'uppercase',
		label: 'One uppercase letter',
		error: 'an uppercase letter',
		test: (value: string) => /[A-Z]/.test(value),
	},
	{
		id: 'lowercase',
		label: 'One lowercase letter',
		error: 'a lowercase letter',
		test: (value: string) => /[a-z]/.test(value),
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
] as const satisfies readonly PasswordRule[]

export const PASSWORD_SCORE = syncLengthTo(PASSWORD_RULES)([
	'weak', 'fair', 'moderate',
	'good', 'strong', 'optimal',
])

//	page data

export const SIGNUP_PAGE_DATA: SignupPageData = {
	id: 'signup',
	title: 'Sign Up',
	description: 'Create your own Inkquest account.',
	form: {
		begin: {
			id: 'begin',
			eyebrow: 'Sign Up',
			heading: 'Join Inkquest.',
			body: 'One account for finding artists, bidding on flash, and booking.',
		},
	},

} as const
