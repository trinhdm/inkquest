import { redirect } from 'next/navigation'
import { getSession, recallAccount } from '@/lib/auth'
import { LogoutForm } from './_form'
import { NavRoutes } from '@/utils/navigation'
import { LOGOUT_PAGE_DATA } from './_utils/data'
import type { Metadata } from 'next'
import type { LogoutFormValues, LogoutScreen } from './_utils/types'

export const metadata: Metadata = {
	title: LOGOUT_PAGE_DATA.title,
	description: LOGOUT_PAGE_DATA.description,
	robots: { index: false },
}

export default async function Logout() {
	const user = await getSession()
	let account = user,
		screen: LogoutScreen = 'confirm'

	if (!user) {
		account = await recallAccount()
		screen = 'finish'
	}

	if (!account) redirect(NavRoutes.AUTH_LOGIN)
	const props = { account, screen } satisfies LogoutFormValues

	return <LogoutForm { ...props } />
}
