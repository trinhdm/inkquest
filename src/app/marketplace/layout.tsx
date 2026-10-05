import { Footer } from '@/components/navigation/Footer'
import { Header } from '@/components/navigation/Header'
import type { ReactNode } from 'react'

export default function MarketplaceLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	return (
		<>
			<Header />
			<main>{ children }</main>
			<Footer />
		</>
	)
}
