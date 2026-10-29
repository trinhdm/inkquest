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

export type VerifyFromScreen =
	Extract<SignupScreen, 'join' | 'verify'>

export type SendLinkScreen =
	Extract<SignupScreen, 'magic' | 'verify'>

export type SignupMethod =
	'email' | 'magic' | 'tel'

export interface SignupFlow {
	endWait: () => void
	handleSignupFlow: (next: SignupScreen) => void
	handleSignupMethod: (method: SignupMethod) => void
	waitUntilExpiry: (event: SubmitEvent<HTMLFormElement>) => void

	signup: FormResults
	magic: FormResults
	resend: FormResults
	verify: FormResults

	formReply: FormResults
	verifyReply: FormResults
	method: SignupMethod
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
