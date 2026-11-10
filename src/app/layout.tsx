import { fontVariables } from '@/styles/fonts'
import { getSession } from '@/lib/auth/session'
import { logout } from '@/lib/auth/actions'
import { AppProvider } from '@/providers/AppProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { ScriptInjector } from '@/components/document/ScriptInjector'
import { COMPANY_NAME } from '@/utils/constants'
import type { Metadata } from 'next'
import '@/styles/_global.scss'

export const metadata: Metadata = {
	title: {
		default: COMPANY_NAME,
		template: `%s | ${COMPANY_NAME}`,
	},
	description: 'Tattoo artist platform',
}

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const user = await getSession()

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
					<AuthProvider logout={ logout } user={ user }>
						<div className="page-container">
							{ children }
						</div>
					</AuthProvider>
				</AppProvider>
			</body>
		</html>
	)
}
