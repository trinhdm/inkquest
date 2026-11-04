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

interface LoginFormProps {
	account: AccountValues | null
}

export const LoginForm = ({ account }: LoginFormProps) => {
	const flow = useLoginFlow(LOGIN_PAGE_DATA, account),
		{ idx, screen } = flow

	useScreenFocus(idx.section, screen)

	const Screen = SCREENS[screen],
		ctxValues = { data: LOGIN_PAGE_DATA, ...flow }

	return (
		<LoginProvider value={ ctxValues }>
			<Screen />
		</LoginProvider>
	)
}

LoginForm.displayName = 'LoginForm'
