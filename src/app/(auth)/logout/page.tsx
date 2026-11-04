import { recallAccount } from '@/lib/auth/account'
import { LogoutBase } from './_components'
import { LOGOUT_PAGE_DATA } from './_utils/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: LOGOUT_PAGE_DATA.title,
	description: LOGOUT_PAGE_DATA.description,
	robots: { index: false },
}

export default async function Logout() {
	const account = await recallAccount()
	return <LogoutBase account={ account } />
}
