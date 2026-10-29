import { createPageCtx } from '@/lib/page/context'
import type { MouseEvent, SubmitEvent, SyntheticEvent } from 'react'
import type { AuthFormIDs } from '../../_utils/types'
import type { FormResults } from '@/lib/form'
import type { SignupPageData, SIGNUP_METHODS } from './signup.data'

export type SignupScreen =
	| 'join' | 'verify'
	| 'inbox' | 'success'

export type ReplyFromStep =
	'resend' | 'verify'

export type SignupMethod =
	typeof SIGNUP_METHODS[number]

type WaitUntilEvent<E extends SyntheticEvent> =
	E extends MouseEvent
		? MouseEvent<HTMLButtonElement>
		: E extends SubmitEvent
			? SubmitEvent<HTMLFormElement>
			: SyntheticEvent<HTMLElement>

export interface SignupFlow {
	endWait: () => void
	goBack: () => void
	handleSignupMethod: (method: SignupMethod) => void
	waitUntilExpiry: <E extends SyntheticEvent>(event: WaitUntilEvent<E>) => void

	idx: AuthFormIDs
	signup: FormResults
	resend: FormResults
	verify: FormResults
	reply: FormResults

	method: SignupMethod
	screen: SignupScreen
	resent: boolean
	to: string
	waiting: boolean
}

export interface SignupContext
	extends SignupFlow {
	data: SignupPageData
}

export const {
	PageProvider: SignupProvider,
	usePageCtx: useSignupCtx,
} = createPageCtx<SignupContext>('signup')
