import { Footer } from '@/components/navigation/Footer'
import { Header } from '@/components/navigation/Header'

export default function CompanyLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const subnav: Header.Props['subnav'] = {
		category: 'Company',
		routes: ['/about', '/faqs', '/careers', '/press', '/support'],
	}

	return (
		<>
			<Header subnav={ subnav } />
			<main>{ children }</main>
			<Footer />
		</>
	)
}
