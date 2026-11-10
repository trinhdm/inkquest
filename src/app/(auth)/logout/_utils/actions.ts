'use server'

import { forgetAccount, handoverAccount, redirectTo } from '@/lib/auth'
import { NavRoutes } from '@/utils/navigation'

export const swapAccount = async () => {
	await forgetAccount()
	redirectTo(NavRoutes.AUTH_LOGIN)
}

export const transferAccount = async () => {
	await handoverAccount()
	redirectTo(NavRoutes.AUTH_LOGIN)
}
