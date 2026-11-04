import { AppProvider } from '@/providers/AppProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { ScriptInjector } from '@/components/document/ScriptInjector'
import { COMPANY_NAME } from '@/utils/constants'
import { fontVariables } from '@/styles/fonts'
import { getSession } from './(auth)/_utils/session'
import { logout } from '@/app/(auth)/logout/_utils/actions'
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
