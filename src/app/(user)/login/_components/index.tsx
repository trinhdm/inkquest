'use client'

import { useEffect, useRef, type ComponentType } from 'react'
import { useLoginFlow } from '../_utils/useLoginFlow'
import { LoginForgot } from './forgot'
import { LoginMagic } from './magic'
import { LoginProvider, type LoginStage } from '../_utils/login.context'
import { LoginReset } from './reset'
import { LoginRoot } from './root'
import { LoginSuccess } from './success'
import { LOGIN_PAGE_DATA } from '../_utils/login.data'

const SCREENS = {
	forgot:		LoginForgot,
	login:		LoginRoot,
	magic:		LoginMagic,
	reset:		LoginReset,
	success:	LoginSuccess,
} satisfies Record<LoginStage, ComponentType>

export const LoginBase = () => {
	const { screen, ...flow } = useLoginFlow()
	const lastScreen = useRef(screen)

	useEffect(() => {				//	on screen change, moves focus to new screen's first field
		if (lastScreen.current === screen) return
		lastScreen.current = screen

		const id = `${LOGIN_PAGE_DATA.id}-${screen}`,
			section = document.getElementById(id)

		if (!section?.contains(document.activeElement))
			section?.focus()
	}, [screen])

	const Screen = SCREENS[screen],
		ctxValues = { data: LOGIN_PAGE_DATA, screen, ...flow }

	return (
		<LoginProvider value={ ctxValues }>
			<Screen />
		</LoginProvider>
	)
}

LoginBase.displayName = 'LoginBase'
