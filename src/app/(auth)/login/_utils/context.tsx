import { createPageCtx } from '@/lib/page/context'
import type { SubmitEvent } from 'react'
import type { AuthFormIDs } from '../../_utils/types'
import type { FormResults } from '@/lib/form/types'
import type { LoginFormData, LoginScreen } from './types'

export interface LoginContext {
	goBack: () => void
	guardSubmit: (event: SubmitEvent<HTMLFormElement>) => void
	navigate: (next: LoginScreen) => void
	restart: () => void
	stopWait: () => void

	login: FormResults
	magic: FormResults
	reset: FormResults
	reply: FormResults

	content: LoginFormData
	destination: string
	idx: AuthFormIDs
	screen: LoginScreen
	waiting: boolean
}

export const {
	PageProvider: LoginProvider,
	usePageCtx: useLoginCtx,
} = createPageCtx<LoginContext>('login')
