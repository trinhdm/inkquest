import type { AccountValues } from '@/lib/auth/schema'
import type { BasePageData } from '@/types/shared'

export type LogoutScreen =
	| 'confirm' | 'finish'

export interface LogoutFormValues {
	account: AccountValues
	screen: LogoutScreen
}

export interface LogoutPageData
	extends BasePageData {}
