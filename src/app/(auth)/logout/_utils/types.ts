import type { AccountValues } from '@/lib/auth/schema'
import type { BasePageData, FieldData } from '@/types/shared'

export type LogoutScreen =
	| 'confirm' | 'finish'

export interface LogoutFormValues {
	account: AccountValues
	screen: LogoutScreen
}

export type LogoutFormData =
	FieldData<string>

export interface LogoutPageData
	extends BasePageData {
	form: Record<LogoutScreen, FieldData<string>>
}
