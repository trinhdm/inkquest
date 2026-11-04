import type { BasePageData } from '@/types/shared'
import type { Field } from '@/components/form/Field'
import type { Icon } from '@/components/core/Icon'
import type { SIGNUP_METHODS } from './data'

export type SignupMethod =
	typeof SIGNUP_METHODS[number]

export interface MethodData {
	copy: {
		input: string
		output: string
	}
	field: {
		label: string
		type: Extract<Field.Props['type'], 'email' | 'tel'>
	}
	submit: string
	toggle: {
		icon: Icon.Props['type']
		label: string
	}
}

export type SignupScreen =
	| 'begin' | 'verify'
	| 'inbox' | 'success'

export type ReplyFromStep =
	| 'resend' | 'verify'

export interface PasswordCriteria {
	readonly id: string
	readonly label: string
	readonly error?: string
	readonly test: (value: string) => boolean
}

export interface SignupPageData
	extends BasePageData {}
