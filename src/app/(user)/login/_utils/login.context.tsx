import { createPageCtx } from '@/lib/page/context'
import type { FormResults } from '@/lib/form'
import type { LoginPageData } from './login.data'
import type { SubmitEvent } from 'react'
import type { AuthFormIDs } from '../../_utils/types'

export type LoginScreen =
	| 'begin' | 'magic'
	| 'forgot' | 'reset'
	| 'success'

export type ReplyFromScreen =
	Extract<LoginScreen, 'begin' | 'magic'| 'forgot'>

export type SendLinkScreen =
	Extract<LoginScreen, 'magic' | 'reset'>

export interface LoginFlow {
	endWait: () => void
	handleLoginFlow: (next: LoginScreen) => void
	waitUntilExpiry: (event: SubmitEvent<HTMLFormElement>) => void

	login: FormResults
	magic: FormResults
	reset: FormResults
	formReply: FormResults

	destination: string
	idx: AuthFormIDs
	screen: LoginScreen
	waiting: boolean
}

export interface LoginContext
	extends LoginFlow {
	data: LoginPageData
}

export const {
	PageProvider: LoginProvider,
	usePageCtx: useLoginCtx,
} = createPageCtx<LoginContext>('login')
