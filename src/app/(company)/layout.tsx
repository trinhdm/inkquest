import { Footer, Header } from '@/components/navigation'

export default function CompanyLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const subnav: Header.Props['subnav'] = {
		category: 'Company',
		routes: ['/about', '/faqs', '/careers', '/press'],
	}

	return (
		<>
			<Header subnav={ subnav } />
			<main>{ children }</main>
			<Footer />
		</>
	)
}
