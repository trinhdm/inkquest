import { getLoginHint } from '../_utils/account'
import { LoginBase } from './_components'
import { LOGIN_PAGE_DATA } from './_utils/login.data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: LOGIN_PAGE_DATA.title,
	description: LOGIN_PAGE_DATA.description,
}

export default async function Login() {
	const account = await getLoginHint()
	return <LoginBase account={ account } />
}
