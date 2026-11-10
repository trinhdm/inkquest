import { PrivacyPolicyBase } from './_components'
import { PRIVACY_PAGE_DATA } from './privacy-policy.data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: PRIVACY_PAGE_DATA.title,
	description: PRIVACY_PAGE_DATA.description,
}

export default function PrivacyPolicy() {
	return <PrivacyPolicyBase />
}
