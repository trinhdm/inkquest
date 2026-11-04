import { getSession, redirectTo, suggestAccount } from '@/lib/auth'
import { LoginForm } from './_form'
import { NavRoutes } from '@/utils/navigation'
import { LOGIN_PAGE_DATA } from './_utils/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: LOGIN_PAGE_DATA.title,
	description: LOGIN_PAGE_DATA.description,
}

export default async function Login() {
	const user = await getSession()
	if (user) redirectTo(NavRoutes.HOME)

	const account = await suggestAccount()
	return <LoginForm account={ account } />
}
