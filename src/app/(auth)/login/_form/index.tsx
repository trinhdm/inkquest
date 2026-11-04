'use client'

import { useEffect, type ComponentType } from 'react'
import { useLoginFlow } from '../_utils/useLoginFlow'
import { useScreenFocus } from '@/hooks/form/useScreenFocus'
import { forgetAccount } from '@/lib/auth'
import { FinishLogin } from './FinishLogin'
import { ForgotPassword } from './ForgotPassword'
import { LoginProvider } from '../_utils/context'
import { MagicLogin } from './MagicLogin'
import { ResetPassword } from './ResetPassword'
import { StartLogin } from './StartLogin'
import { LOGIN_PAGE_DATA } from '../_utils/data'
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
	useEffect(() => {
		if (account) void forgetAccount()
	}, [account])

	const Screen = SCREENS[screen]

	return (
		<LoginProvider value={ ctxValues }>
			<Screen />
		</LoginProvider>
	)
}

LoginForm.displayName = 'LoginForm'
