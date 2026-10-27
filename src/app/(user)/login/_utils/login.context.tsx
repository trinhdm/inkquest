import { createPageCtx } from '@/lib/page/context'
import type { FormResults } from '@/lib/form'
import type { LoginPageData } from './login.data'
import type { SubmitEvent } from 'react'

export type LoginScreen =
	| 'email' | 'magic'
	| 'forgot' | 'reset'
	| 'success'

export type ReplyFromScreen =
	Extract<LoginScreen, 'email' | 'magic'>

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
	screen: LoginScreen
	resent: boolean
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
