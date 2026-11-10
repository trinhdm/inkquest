'use client'

import { useScreenFocus } from '@/hooks/form/useScreenFocus'
import { useSignupFlow } from '../_utils/useSignupFlow'
import { FinishSignup } from './FinishSignup'
import { CheckSignup } from './CheckSignup'
import { SignupProvider } from '../_utils/context'
import { StartSignup } from './StartSignup'
import { VerifySignup } from './VerifySignup'
import { SIGNUP_PAGE_DATA } from '../_utils/data'
import type { ComponentType } from 'react'
import type { SignupScreen } from '../_utils/types'

const SCREENS = {
	start:		StartSignup,
	check:		CheckSignup,
	verify:		VerifySignup,
	finish:		FinishSignup,
} satisfies Record<SignupScreen, ComponentType>

export const SignupForm = () => {
	const ctxValues = useSignupFlow(SIGNUP_PAGE_DATA),
		{ idx, screen } = ctxValues

	useScreenFocus(screen, idx.section)

	const Screen = SCREENS[screen]

	return (
		<SignupProvider value={ ctxValues }>
			<Screen />
		</SignupProvider>
	)
}

SignupForm.displayName = 'SignupForm'
