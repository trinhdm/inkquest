import { CareersBase } from './_components'
import { CAREERS_PAGE_DATA } from './_utils/careers.data'
import type { Metadata } from 'next'
import './careers.scss'

export const metadata: Metadata = {
	title: CAREERS_PAGE_DATA.title,
	description: CAREERS_PAGE_DATA.description,
}

export default function Careers() {
	return <CareersBase />
}
