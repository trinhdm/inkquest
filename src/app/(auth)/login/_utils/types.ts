import type { BasePageData, FieldData } from '@/types/shared'

export type LoginScreen =
	| 'begin' | 'magic'
	| 'forgot' | 'reset'
	| 'success'

export type ReplyFromStep =
	Extract<LoginScreen, 'begin' | 'magic'| 'reset'>

export type LoginFormData =
	FieldData<string>

export interface LoginPageData
	extends BasePageData {
	form: Record<LoginScreen, FieldData<string>>
}
