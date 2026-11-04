'use client'

import { useLoginFlow } from '../_utils/useLoginFlow'
import { useScreenFocus } from '@/hooks/form/useScreenFocus'
import { LoginForgot } from '../_form/forgot'
import { LoginMagic } from '../_form/magic'
import { LoginProvider } from '../_utils/context'
import { LoginReset } from '../_form/reset'
import { LoginRoot } from '../_form/root'
import { LoginSuccess } from '../_form/success'
import { LOGIN_PAGE_DATA } from '../_utils/data'
import type { ComponentType } from 'react'
import type { AccountValues } from '@/lib/auth/schema'
import type { LoginScreen } from '../_utils/types'

const SCREENS = {
	begin:		LoginRoot,
	forgot:		LoginForgot,
	magic:		LoginMagic,
	reset:		LoginReset,
	success:	LoginSuccess,
} satisfies Record<LoginScreen, ComponentType>

interface LoginBaseProps {
	account: AccountValues | null
}

export const LoginBase = ({ account }: LoginBaseProps) => {
	const { idx, screen, ...flow } = useLoginFlow(LOGIN_PAGE_DATA, account)
	useScreenFocus(screen, idx.section)

	const Screen = SCREENS[screen],
		ctxValues = { data: LOGIN_PAGE_DATA, idx, screen, ...flow }

	return (
		<LoginProvider value={ ctxValues }>
			<Screen />
		</LoginProvider>
	)
}

LoginBase.displayName = 'LoginBase'
