import { createPageCtx } from '@/lib/page/context'
import type { SubmitEvent } from 'react'
import type { AuthFormData, AuthFormIDs } from '../../_utils/types'
import type { FormResults } from '@/lib/form/types'
import type { SignupMethod, SignupScreen } from './types'

export interface SignupContext {
	goBack: () => void
	guardSubmit: (event: SubmitEvent<HTMLFormElement>) => void
	navigate: (next: SignupScreen) => void
	selectMethod: (method: SignupMethod) => void
	stopWait: () => void

	signup: FormResults
	resend: FormResults
	verify: FormResults
	reply: FormResults

	content: AuthFormData
	contact: string
	destination: string
	idx: AuthFormIDs
	method: {
		active: SignupMethod
		inactive: SignupMethod[]
	}
	screen: SignupScreen
	waiting: boolean
}

export const {
	PageProvider: SignupProvider,
	usePageCtx: useSignupCtx,
} = createPageCtx<SignupContext>('signup')
