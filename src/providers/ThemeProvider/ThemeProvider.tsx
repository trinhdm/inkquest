import { createContext, use, type ReactNode } from 'react'

export type SiteTheme =
	| 'dark'
	| 'light'
	| 'system'

const DEFAULT_THEME: SiteTheme = 'dark'

export const ThemeContext = createContext<SiteTheme | null>(null)

export const useSafeTheme = () => use(ThemeContext) || DEFAULT_THEME
export const useTheme = () => {
	const ctx = use(ThemeContext)
	if (!ctx) throw new Error('missing ThemeProvider')
	return ctx
}

export interface ThemeProviderProps {
	children?: ReactNode
	theme?: SiteTheme
}

export const ThemeProvider = ({
	children,
}: ThemeProviderProps) => {
	const currentTheme = useSafeTheme()
	return <ThemeContext value={ currentTheme }>{ children }</ThemeContext>
}
