import type { BasePageData, FieldData } from '@/types/shared'
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
	toggle: {
		icon: Icon.Props['type']
		label: string
	}
	verify: {
		submit: string
		type: 'code' | 'link'
	}
}

export type SignupScreen =
	| 'start' | 'check'
	| 'verify' | 'finish'

export type ReplyFromStep =
	| 'resend' | 'verify'

export interface PasswordRule {
	readonly id: string
	readonly label: string
	readonly error?: string
	readonly test: (value: string) => boolean
}

export type SignupFormData =
	FieldData<string>

export interface SignupPageData
	extends BasePageData {
	form: Record<SignupScreen, FieldData<string>>
}
