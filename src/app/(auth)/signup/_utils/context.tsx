import { createPageCtx } from '@/lib/page/context'
import type { SubmitEvent } from 'react'
import type { AuthFormIDs } from '../../_utils/types'
import type { FormResults } from '@/lib/form/types'
import type { SignupMethod, SignupPageData, SignupScreen } from './types'

export interface SignupFlow {
	goBack: () => void
	guardSubmit: (event: SubmitEvent<HTMLFormElement>) => void
	handleSignup: (method: SignupMethod) => void
	navigate: (next: SignupScreen) => void
	stopWait: () => void

	signup: FormResults
	resend: FormResults
	verify: FormResults
	reply: FormResults

	destination: string
	idx: AuthFormIDs
	method: {
		active: SignupMethod
		inactive: SignupMethod[]
	}
	screen: SignupScreen
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
