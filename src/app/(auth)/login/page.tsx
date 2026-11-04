import { suggestAccount } from '@/lib/auth/account'
import { LoginBase } from './_components'
import { LOGIN_PAGE_DATA } from './_utils/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: LOGIN_PAGE_DATA.title,
	description: LOGIN_PAGE_DATA.description,
}

export default async function Login() {
	const account = await suggestAccount()
	return <LoginBase account={ account } />
}
