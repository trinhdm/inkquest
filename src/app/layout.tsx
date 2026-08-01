import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from '@/providers/ThemeProvider'
import { SchemeScript } from '@/providers/ThemeProvider/SchemeScript/SchemeScript'
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
					{ children }
				</ThemeProvider>
			</body>
		</html>
	)
}
