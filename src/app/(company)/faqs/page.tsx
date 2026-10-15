import { FaqsBase } from './_components'
import type { Metadata } from 'next'
import './faqs.scss'

export const metadata: Metadata = {
	title: 'FAQs',
	description: 'Everything about bidding, booking, verification, and payouts.',
}

export default function FAQs() {
	return <FaqsBase />
}
