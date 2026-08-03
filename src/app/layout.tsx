import { Geist, Geist_Mono } from "next/font/google"
import { CssVariables } from '@/components/core/CssVariables'
import { ScriptInjector } from '@/components/core/ScriptInjector'
import { ThemeProvider } from '@/providers/ThemeProvider'
import type { Metadata } from 'next'
import '@/styles/_global.scss'

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Inkquest",
	description: "Tattoo artist platform",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			suppressHydrationWarning
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable}`}
		>
			<head>
				<ScriptInjector defaultTheme="dark" />
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
