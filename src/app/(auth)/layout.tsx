import { Footer } from '@/components/navigation/Footer'
import { Header } from '@/components/navigation/Header'
import type { ReactNode } from 'react'
import './auth-layout.scss'

export default function AuthLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	return (
		<>
			<Header navbar={ { routes: [] } } subnav={ null } />
			<main>{ children }</main>
			<Footer />
		</>
	)
}
