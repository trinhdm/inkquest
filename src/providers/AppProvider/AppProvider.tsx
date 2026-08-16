'use client'

import { ThemeProvider } from '../ThemeProvider'
import type { ReactNode } from 'react'

interface AppProviderProps {
	children: ReactNode
	themeStyles: ReactNode
}

// export const AppContext = createContext<null>(null)

export const AppProvider = ({ children, themeStyles }: AppProviderProps) => {
	return (
		<ThemeProvider>
			{ themeStyles }
			{ children }
		</ThemeProvider>
	)
}
