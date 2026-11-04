import type { AuthFormData } from '../../_utils/types'
import type { BasePageData } from '@/types/shared'

export type LoginScreen =
	| 'start' | 'magic' | 'finish'
	| 'forgot' | 'reset'

export type ReplyFromStep =
	Extract<LoginScreen, 'start' | 'magic'| 'reset'>

export interface LoginPageData
	extends BasePageData {
	form: Record<LoginScreen, AuthFormData>
}
