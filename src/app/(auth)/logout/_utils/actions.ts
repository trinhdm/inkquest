'use server'

import { redirect } from 'next/navigation'
import { forgetRememberedAccount, setAccountHint } from '@/lib/auth/account'
import { NavRoutes } from '@/utils/navigation'

export const switchAccount = async () => {
	await forgetRememberedAccount()
	redirect(NavRoutes.AUTH_LOGIN)
}

export const suggestAccount = async () => {
	await setAccountHint()
	redirect(NavRoutes.AUTH_LOGIN)
}
