'use client'

import { useLoginFlow } from '../_utils/useLoginFlow'
import { useScreenFocus } from '@/hooks/form/useScreenFocus'
import { ForgotPassword } from './ForgotPassword'
import { MagicLogin } from './MagicLogin'
import { LoginProvider } from '../_utils/context'
import { ResetPassword } from './ResetPassword'
import { StartLogin } from './StartLogin'
import { FinishLogin } from './FinishLogin'
import { LOGIN_PAGE_DATA } from '../_utils/data'
import type { ComponentType } from 'react'
import type { AccountValues } from '@/lib/auth/schema'
import type { LoginScreen } from '../_utils/types'

const SCREENS = {
	start:		StartLogin,
	magic:		MagicLogin,
	forgot:		ForgotPassword,
	reset:		ResetPassword,
	finish:		FinishLogin,
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
