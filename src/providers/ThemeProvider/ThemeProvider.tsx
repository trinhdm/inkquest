'use client'

import { use, useMemo, type ReactNode } from 'react'
import { mergeTheme } from './theme'
import { ThemeContext } from './theme.context'
import { DEFAULT_THEME } from './constants'
import type { SiteTheme } from './theme.types'

interface ThemeProviderProps {
	children?: ReactNode
	// prefix?: string
	theme?: SiteTheme
}

export const useSafeTheme = () => use(ThemeContext) || DEFAULT_THEME
export const useTheme = () => {
	const ctx = use(ThemeContext)
	if (!ctx) throw new Error('missing ThemeProvider')
	return ctx
}

export const ThemeProvider = ({
	children,
	theme,
}: ThemeProviderProps) => {
	const currentTheme = useSafeTheme()
	const mergedTheme = useMemo(
		() => mergeTheme(currentTheme, theme),
		[currentTheme, theme]
	)

	return <ThemeContext value={ mergedTheme }>{ children }</ThemeContext>
}
