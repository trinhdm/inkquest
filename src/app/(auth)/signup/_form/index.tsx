'use client'

import { useScreenFocus } from '@/hooks/form/useScreenFocus'
import { useSignupFlow } from '../_utils/useSignupFlow'
import { SignupMagic } from './magic'
import { SignupProvider } from '../_utils/context'
import { SignupRoot } from './root'
import { SignupSuccess } from './success'
import { SignupVerify } from './verify'
import { SIGNUP_PAGE_DATA } from '../_utils/data'
import type { ComponentType } from 'react'
import type { SignupScreen } from '../_utils/types'

const SCREENS = {
	begin:		SignupRoot,
	inbox:		SignupMagic,
	success:	SignupSuccess,
	verify:		SignupVerify,
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
