import { createPageCtx } from '@/lib/page/context'
import type { FormActionProps, FormState } from '@/lib/form'
import type { LoginPageData } from './login.data'

export type LoginStage =
	| 'login' | 'magic'
	| 'forgot' | 'reset'
	| 'success'

export interface LoginFlow {
	handleLoginFlow: (next: LoginStage) => void
	sendResetLink: () => void

	login: FormActionProps
	magic: FormActionProps
	reset: FormActionProps

	formReply: FormState
	resent: boolean
	screen: LoginStage
}

export interface LoginContext
	extends LoginFlow {
	data: LoginPageData
}

export const {
	PageProvider: LoginProvider,
	usePageCtx: useLoginCtx,
} = createPageCtx<LoginContext>('login')
