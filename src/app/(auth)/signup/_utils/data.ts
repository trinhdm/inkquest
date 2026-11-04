import { syncLengthTo } from '@/utils/helpers'
import type { BasePageData } from '@/types/shared'
import type { Field } from '@/components/form/Field'
import type { Icon } from '@/components/core/Icon'

export const SEQUENCE_CHECK_MIN = 4

export const CODE_EXPIRY_SECONDS = 10 * 60
export const RESEND_COOLDOWN_SECONDS = 30

export const SIGNUP_METHODS = ['email', 'magic', 'phone'] as const

export type SignupMethod =
	typeof SIGNUP_METHODS[number]

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
		submit: 'Create account',
		toggle: {
			icon: 'email',
			label: 'Use email & password',
		},
	},
	magic: {
		...EMAIL_DATA,
		submit: 'Send magic link',
		toggle: {
			icon: 'wand-sparkles',
			label: 'Email me a magic link',
		},
	},
	phone: {
		copy: {
			input: 'number',
			output: 'text',
		},
		field: {
			label: 'Phone Number',
			type: 'tel',
		},
		submit: 'Send code',
		toggle: {
			icon: 'phone',
			label: 'Use phone number',
		},
	},
} as const satisfies Record<SignupMethod, MethodData>

interface MethodData {
	copy: {
		input: string
		output: string
	}
	field: {
		label: string
		type: Extract<Field.Props['type'], 'email' | 'tel'>
	}
	toggle: {
		icon: Icon.Props['type']
		label: string
	}
	submit: string
}

export interface PasswordCriteria {
	readonly id: string
	readonly label: string
	readonly error?: string
	readonly test: (value: string) => boolean
}

export const PASSWORD_RULES = [
	{
		id: 'length',
		label: '6+ characters',
		error: 'at least 6 characters',
		test: (value: string) => value.length >= 6,
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
] as const satisfies readonly PasswordCriteria[]

export const PASSWORD_SCORE = syncLengthTo(PASSWORD_RULES)([
	'weak', 'fair', 'moderate',
	'good', 'strong', 'optimal',
])

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
