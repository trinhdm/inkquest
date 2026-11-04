'use server'

import { redirect } from 'next/navigation'
import { endSession, getSession } from '../../_utils/session'
import { forgetRememberedAccount, rememberAccount, setLoginHint } from '../../_utils/account'
import { NavRoutes } from '@/utils/navigation'

export const logout = async () => {
	const user = await getSession()
	if (user) await rememberAccount(user)
	await endSession()
	redirect(NavRoutes.AUTH_LOGOUT)
}

export const switchAccount = async () => {
	await forgetRememberedAccount()
	redirect(NavRoutes.AUTH_LOGIN)
}

export const hintAccount = async () => {
	await setLoginHint()
	redirect(NavRoutes.AUTH_LOGIN)
}
