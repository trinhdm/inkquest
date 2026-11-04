import { getSession, redirectTo } from '@/lib/auth'
import { NavRoutes } from '@/utils/navigation'
import { SignupForm } from './_form'
import { SIGNUP_PAGE_DATA } from './_utils/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: SIGNUP_PAGE_DATA.title,
	description: SIGNUP_PAGE_DATA.description,
}

export default async function Signup() {
	const user = await getSession()
	if (user) redirectTo(NavRoutes.HOME)

	return <SignupForm />
}
