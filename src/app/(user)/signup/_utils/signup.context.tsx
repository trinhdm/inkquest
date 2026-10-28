import { createPageCtx } from '@/lib/page/context'
import type { FormResults } from '@/lib/form'
import type { SignupPageData } from './signup.data'
import type { SubmitEvent } from 'react'

export type SignupScreen =
	| 'join' | 'magic' | 'phone'
	| 'verify' | 'success'
	// | 'otp-email' | 'otp-phone'

export type ReplyFromScreen =
	Extract<SignupScreen, 'join' | 'magic'>

export type SendLinkScreen =
	Extract<SignupScreen, 'magic'>

export interface SignupFlow {
	endWait: () => void
	handleSignupFlow: (next: SignupScreen) => void
	waitUntilExpiry: (event: SubmitEvent<HTMLFormElement>) => void

	signup: FormResults
	magic: FormResults
	verify: FormResults

	formReply: FormResults
	screen: SignupScreen
	resent: boolean
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
