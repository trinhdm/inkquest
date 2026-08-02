import { Geist, Geist_Mono } from "next/font/google"
import { CssVariables } from '@/components/core/CssVariables'
import { SchemeScript } from '@/providers/ThemeProvider/SchemeScript/SchemeScript'
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
				<SchemeScript />
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
