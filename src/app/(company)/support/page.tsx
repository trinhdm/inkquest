import { SupportBase } from './_components'
import { SUPPORT_PAGE_DATA } from './_utils/data'
import type { Metadata } from 'next'
import './support.scss'

export const metadata: Metadata = {
	title: SUPPORT_PAGE_DATA.title,
	description: SUPPORT_PAGE_DATA.description,
}

export default function Support() {
	return <SupportBase />
}
