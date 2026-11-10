import { FaqsBase } from './_components'
import { FAQS_PAGE_DATA } from './_utils/faqs.data'
import type { Metadata } from 'next'
import './faqs.scss'

export const metadata: Metadata = {
	title: FAQS_PAGE_DATA.title,
	description: FAQS_PAGE_DATA.description,
}

export default function FAQs() {
	return <FaqsBase />
}
