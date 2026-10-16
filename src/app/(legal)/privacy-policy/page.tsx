import { PrivacyPolicyBase } from './_components'
import { COMPANY_NAME } from '@/utils/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Privacy Policy',
	description: `${COMPANY_NAME} Privacy Policy.`,
}

export default function PrivacyPolicy() {
	return <PrivacyPolicyBase />
}
