import { Archivo, Archivo_Black, Space_Mono } from 'next/font/google'
import { CssVariables } from '@/components/core/CssVariables'
import { ScriptInjector } from '@/components/core/ScriptInjector'
import { ThemeProvider } from '@/providers/ThemeProvider'
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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			suppressHydrationWarning
			lang="en"
			className={`${archivo.variable} ${archivoBlack.variable} ${spaceMono.variable}`}
		>
			<head>
				<ScriptInjector />
			</head>
			<body>
				<ThemeProvider>
					<CssVariables />
					{ children }
				</ThemeProvider>
			</body>
		</html>
	)
}
