import { Footer } from '@/components/navigation/Footer'
import { Header } from '@/components/navigation/Header'
import type { ReactNode } from 'react'

export default function CommunityLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	const subnav: Header.Props['subnav'] = {
		routes: ['/community'],
		// routes: ['/community/feed', '/community/events', '/community/spotlights'],
	}

	return (
		<>
			<Header subnav={ subnav } />
			<main>{ children }</main>
			<Footer />
		</>
	)
}
