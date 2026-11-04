import { redirect } from 'next/navigation'
import { endSession, getSession } from './session'
import { rememberAccount } from './account'
import { NavRoutes } from '@/utils/navigation'

export const logout = async () => {
	const user = await getSession()
	if (user) await rememberAccount(user)
	await endSession()
	redirect(NavRoutes.AUTH_LOGOUT)
}
