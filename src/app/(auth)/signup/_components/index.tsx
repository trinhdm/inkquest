'use client'

import { useEffect, useRef, type ComponentType } from 'react'
import { useSignupFlow } from '../_utils/useSignupFlow'
import { SignupMagic } from '../_form/magic'
import { SignupProvider, type SignupScreen } from '../_utils/context'
import { SignupRoot } from '../_form/root'
import { SignupSuccess } from '../_form/success'
import { SignupVerify } from '../_form/verify'
import { SIGNUP_PAGE_DATA } from '../_utils/data'

const SCREENS = {
	begin:		SignupRoot,
	inbox:		SignupMagic,
	success:	SignupSuccess,
	verify:		SignupVerify,
} satisfies Record<SignupScreen, ComponentType>

export const SignupBase = () => {
	const { idx, screen, ...flow } = useSignupFlow(SIGNUP_PAGE_DATA)
	const lastScreen = useRef(screen)

	useEffect(() => {				//	on screen change, moves focus to new screen's first field
		if (lastScreen.current === screen) return

		lastScreen.current = screen
		const section = document.getElementById(idx.section)

		if (!section?.contains(document.activeElement))
			section?.focus()
	}, [idx.section, screen])

	const Screen = SCREENS[screen],
		ctxValues = { data: SIGNUP_PAGE_DATA, idx, screen, ...flow }

	return (
		<SignupProvider value={ ctxValues }>
			<Screen />
		</SignupProvider>
	)
}

SignupBase.displayName = 'SignupBase'
