import type { BasePageData } from '@/types/shared'

export type LoginScreen =
	| 'begin' | 'magic'
	| 'forgot' | 'reset'
	| 'success'

export type ReplyFromStep =
	Extract<LoginScreen, 'begin' | 'magic'| 'reset'>

export interface LoginPageData
	extends BasePageData {}
