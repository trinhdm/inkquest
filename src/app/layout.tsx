import { Archivo, Archivo_Black, Space_Mono } from 'next/font/google'
import { AppProvider } from '@/providers/AppProvider'
import { Footer, Navbar, Subnav } from '@/components/navigation'
import { ScriptInjector } from '@/components/document/ScriptInjector'
import type { Metadata } from 'next'
import '@/styles/_global.scss'

export const metadata: Metadata = {
	title: "Inkquest",
	description: "Tattoo artist platform",
}

const archivo = Archivo({
	variable: '--font-archivo',
	weight: ['400', '600', '700'],
	subsets: ['latin'],
})

const archivoBlack = Archivo_Black({
	variable: '--font-archivo-black',
	weight: '400',
	subsets: ['latin'],
})

const spaceMono = Space_Mono({
	variable: '--font-space-mono',
	weight: ['400', '700'],
	subsets: ['latin'],
})

const fontsList = `${archivo.variable} ${archivoBlack.variable} ${spaceMono.variable}`

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			suppressHydrationWarning
			lang="en"
			className={ fontsList }
		>
			<head>
				<ScriptInjector />
			</head>
			<body>
				<AppProvider>
					<header>
						<Navbar routes={ ['/discover', '/marketplace', '/community'] } />
						<Subnav routes={ ['/community', '/community/feed', '/community/events', '/community/spotlights'] } />
					</header>
					<main>{ children }</main>
					<Footer />
				</AppProvider>
			</body>
		</html>
	)
}
