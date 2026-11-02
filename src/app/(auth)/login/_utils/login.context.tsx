import { createPageCtx } from '@/lib/page/context'
import type { SubmitEvent } from 'react'
import type { AuthFormIDs } from '../../_utils/types'
import type { FormResults } from '@/lib/form'
import type { LoginPageData } from './login.data'

export type LoginScreen =
	| 'begin' | 'magic'
	| 'forgot' | 'reset'
	| 'success'

export type ReplyFromStep =
	Extract<LoginScreen, 'begin' | 'magic'| 'reset'>

export interface LoginFlow {
	goBack: () => void
	guardSubmit: (event: SubmitEvent<HTMLFormElement>) => void
	navigate: (next: LoginScreen) => void
	restart: () => void
	stopWait: () => void

	login: FormResults
	magic: FormResults
	reset: FormResults
	reply: FormResults

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
