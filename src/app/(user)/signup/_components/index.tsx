'use client'

import { useEffect, useRef, type ComponentType } from 'react'
import { useSignupFlow } from '../_utils/useSignupFlow'
import { SignupOTP } from './otp'
import { SignupMagic } from './magic'
import { SignupProvider, type SignupScreen } from '../_utils/signup.context'
import { SignupRoot } from './root'
import { SignupSuccess } from './success'
import { SIGNUP_PAGE_DATA } from '../_utils/signup.data'

const SCREENS = {
	join:		SignupRoot,
	verify:		SignupOTP,
	magic:		SignupMagic,
	phone:		SignupOTP,
	success:	SignupSuccess,
} satisfies Record<SignupScreen, ComponentType>

export const SignupBase = () => {
	const { screen, ...flow } = useSignupFlow()
	const lastScreen = useRef(screen)

	useEffect(() => {				//	on screen change, moves focus to new screen's first field
		if (lastScreen.current === screen) return
		lastScreen.current = screen

		const id = `${SIGNUP_PAGE_DATA.id}-${screen}`,
			section = document.getElementById(id)

		if (!section?.contains(document.activeElement))
			section?.focus()
	}, [screen])

	const Screen = SCREENS[screen],
		ctxValues = { data: SIGNUP_PAGE_DATA, screen, ...flow }

	return (
		<SignupProvider value={ ctxValues }>
			<Screen />
		</SignupProvider>
	)
}

SignupBase.displayName = 'SignupBase'
