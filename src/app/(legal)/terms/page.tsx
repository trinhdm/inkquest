import { TermsConditionsBase } from './_components'
import { COMPANY_NAME } from '@/utils/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Terms of Service',
	description: `${COMPANY_NAME} Terms and Conditions.`,
}

export default function TermsConditions() {
	return <TermsConditionsBase />
}
