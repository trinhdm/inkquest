'use client'

import { useScreenFocus } from '@/hooks/form/useScreenFocus'
import { useSignupFlow } from '../_utils/useSignupFlow'
import { SignupMagic } from '../_form/magic'
import { SignupProvider } from '../_utils/context'
import { SignupRoot } from '../_form/root'
import { SignupSuccess } from '../_form/success'
import { SignupVerify } from '../_form/verify'
import { SIGNUP_PAGE_DATA } from '../_utils/data'
import type { ComponentType } from 'react'
import type { SignupScreen } from '../_utils/types'

const SCREENS = {
	begin:		SignupRoot,
	inbox:		SignupMagic,
	success:	SignupSuccess,
	verify:		SignupVerify,
} satisfies Record<SignupScreen, ComponentType>

export const SignupBase = () => {
	const { idx, screen, ...flow } = useSignupFlow(SIGNUP_PAGE_DATA)
	useScreenFocus(screen, idx.section)

	const Screen = SCREENS[screen],
		ctxValues = { data: SIGNUP_PAGE_DATA, idx, screen, ...flow }

	return (
		<SignupProvider value={ ctxValues }>
			<Screen />
		</SignupProvider>
	)
}

SignupBase.displayName = 'SignupBase'
