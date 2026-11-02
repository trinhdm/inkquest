import { SignupBase } from './_components'
import { SIGNUP_PAGE_DATA } from './_utils/signup.data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: SIGNUP_PAGE_DATA.title,
	description: SIGNUP_PAGE_DATA.description,
}

export default function Signup() {
	return <SignupBase />
}
