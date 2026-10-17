import { AppProvider } from '@/providers/AppProvider'
import { ScriptInjector } from '@/components/document/ScriptInjector'
import { COMPANY_NAME } from '@/utils/constants'
import { fontVariables } from '@/styles/fonts'
import type { Metadata } from 'next'
import '@/styles/_global.scss'

export const metadata: Metadata = {
	title: {
		default: COMPANY_NAME,
		template: `%s | ${COMPANY_NAME}`,
	},
	description: 'Tattoo artist platform',
}

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			suppressHydrationWarning
			lang="en"
			className={ fontVariables }
			data-scroll-behavior="smooth"
		>
			<head>
				<ScriptInjector />
			</head>
			<body>
				<AppProvider>
					<div className="page-container">
						{ children }
					</div>
				</AppProvider>
			</body>
		</html>
	)
}
