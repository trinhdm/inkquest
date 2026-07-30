import { createContext, use, useEffect, type ReactNode } from 'react'
import { DEFAULT_THEME } from './constants'
import { PREFIX_CSS_SELECTOR, PREFIX_CSS_VARS } from '@/utils/constants'
import type { SiteTheme } from './theme.types'

export const ThemeContext = createContext<SiteTheme | null>(null)

export const useSafeTheme = () => use(ThemeContext) || DEFAULT_THEME
export const useTheme = () => {
	const ctx = use(ThemeContext)
	if (!ctx) throw new Error('missing ThemeProvider')
	return ctx
}

export interface ThemeProviderProps {
	children?: ReactNode
	prefix?: string
	theme?: SiteTheme
}

export const ThemeProvider = ({
	children,
}: ThemeProviderProps) => {
	const currentTheme = useSafeTheme()

	useEffect(() => {
		const docuEl = document.documentElement,
			rootStyle = getComputedStyle(docuEl),
			cssPrefix = rootStyle.getPropertyValue(PREFIX_CSS_VARS)

		if (!cssPrefix)
			docuEl.style.setProperty(PREFIX_CSS_VARS, PREFIX_CSS_SELECTOR)
	}, [])

	return <ThemeContext value={ currentTheme }>{ children }</ThemeContext>
}
