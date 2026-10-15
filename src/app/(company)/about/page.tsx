import { AboutBase } from './_components'
import { COMPANY_NAME } from '@/utils/constants'
import type { Metadata } from 'next'
import './about.scss'

export const metadata: Metadata = {
	title: 'About Us',
	description: `${COMPANY_NAME} is a marketplace and community connecting tattoo artists with clients.`,
}

export default function About() {
	return <AboutBase />
}
