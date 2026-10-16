import { Footer } from '@/components/navigation/Footer'
import { Header } from '@/components/navigation/Header'
import type { ReactNode } from 'react'
import './legal-layout.scss'

export default function LegalLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	const subnav: Header.Props['subnav'] = {
		category: 'Legal',
		routes: ['/privacy-policy', '/terms', '/cookies'],
	}

	return (
		<>
			<Header subnav={ subnav } />
			<main>{ children }</main>
			<Footer />
		</>
	)
}
