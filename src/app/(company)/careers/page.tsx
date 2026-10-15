import { CareersBase } from './_components'
import type { Metadata } from 'next'
import './careers.scss'

export const metadata: Metadata = {
	title: 'Careers',
	description: `We're a team building the place where tattoo work gets found, priced, and booked on the artist's terms.`,
}

export default function Careers() {
	return <CareersBase />
}
