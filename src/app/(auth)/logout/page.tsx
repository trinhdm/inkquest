import { getRememberedAccount } from '../_utils/account'
import { LogoutBase } from './_components'
import { LOGOUT_PAGE_DATA } from './_utils/data'
import { MOCK_ACCOUNT } from '@/lib/form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: LOGOUT_PAGE_DATA.title,
	description: LOGOUT_PAGE_DATA.description,
	robots: { index: false },
}

export default async function Logout() {
	const account = await getRememberedAccount()
	return <LogoutBase account={ account ?? MOCK_ACCOUNT } />
}
