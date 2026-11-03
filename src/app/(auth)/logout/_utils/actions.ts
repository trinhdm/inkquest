'use server'

import { redirect } from 'next/navigation'
import { forgetRememberedAccount, rememberAccount } from '../../_utils/account'
import { NavRoutes } from '@/utils/navigation'
import { MOCK_ACCOUNT } from '@/utils/constants'

export const logout = async () => {
	await rememberAccount(MOCK_ACCOUNT)
	//	TODO: (with sessions) read the account from the session first, then await deleteSession()
	redirect(NavRoutes.AUTH_LOGOUT)
}

export const switchAccount = async () => {
	await forgetRememberedAccount()
	redirect(NavRoutes.AUTH_LOGIN)
}
