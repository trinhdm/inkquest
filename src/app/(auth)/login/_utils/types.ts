import type { BasePageData, FieldData } from '@/types/shared'

export type LoginScreen =
	| 'start' | 'magic'
	| 'forgot' | 'reset'
	| 'finish'

export type ReplyFromStep =
	Extract<LoginScreen, 'start' | 'magic'| 'reset'>

export type LoginFormData =
	FieldData<string>

export interface LoginPageData
	extends BasePageData {
	form: Record<LoginScreen, FieldData<string>>
}
