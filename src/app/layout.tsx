import { Archivo, Archivo_Black, Space_Mono } from 'next/font/google'
import { AppProvider } from '@/providers/AppProvider'
import { Navbar } from '@/components/layout/Navbar'
import { ScriptInjector } from '@/components/document'
// import { ScriptInjector, StyleInliner, VariantStyleInliner } from '@/components/document'
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
	// const InlinedStyles = (
	// 	<>
	// 		<StyleInliner />
	// 		<VariantStyleInliner />
	// 	</>
	// )

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
					<Navbar routes={ ['/discover', '/marketplace', '/community'] } />
					{ children }
				</AppProvider>
			</body>
		</html>
	)
}
