import { TermsConditionsBase } from './_components'
import { TERMS_PAGE_DATA } from './terms.data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: TERMS_PAGE_DATA.title,
	description: TERMS_PAGE_DATA.description,
}

export default function TermsConditions() {
	return <TermsConditionsBase />
}
