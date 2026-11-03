import { getNavigationGroup } from '@/utils/navigation'
import { Footer } from '@/components/navigation/Footer'
import { Header } from '@/components/navigation/Header'
import type { ReactNode } from 'react'

export default function CompanyLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	const subnav: Header.Props['subnav'] = getNavigationGroup('Company')

	return (
		<>
			<Header subnav={ subnav } />
			<main>{ children }</main>
			<Footer />
		</>
	)
}
