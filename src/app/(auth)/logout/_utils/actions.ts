'use server'

import { redirect, RedirectType } from 'next/navigation'
import { forgetAccount, handoverAccount } from '@/lib/auth/account'
import { NavRoutes } from '@/utils/navigation'

const redirectLogout = () =>
	redirect(NavRoutes.AUTH_LOGIN, RedirectType.replace)

export const switchAccount = async () => {
	await forgetAccount()
	redirectLogout()
}

export const transferAccount = async () => {
	await handoverAccount()
	redirectLogout()
}
