'use client'

import { useLoginFlow } from '../_utils/useLoginFlow'
import { useScreenFocus } from '@/hooks/form/useScreenFocus'
import { LoginForgot } from './forgot'
import { LoginMagic } from './magic'
import { LoginProvider } from '../_utils/context'
import { LoginReset } from './reset'
import { LoginRoot } from './root'
import { LoginSuccess } from './success'
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

interface LoginFormProps {
	account: AccountValues | null
}

export const LoginForm = ({ account }: LoginFormProps) => {
	const ctxValues = useLoginFlow(LOGIN_PAGE_DATA, account),
		{ idx, screen } = ctxValues

	useScreenFocus(screen, idx.section)

	const Screen = SCREENS[screen]

	return (
		<LoginProvider value={ ctxValues }>
			<Screen />
		</LoginProvider>
	)
}

LoginForm.displayName = 'LoginForm'
