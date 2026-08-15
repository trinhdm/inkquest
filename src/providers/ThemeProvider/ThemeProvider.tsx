'use client'

import { createContext, use, useMemo, type ReactNode } from 'react'
import { mergeTheme } from './theme'
import { useThemeName } from '@/hooks/useThemeName'
import { DEFAULT_THEME } from './constants'
import type { SiteTheme } from './theme.types'

interface ThemeProviderProps {
	children?: ReactNode
	// prefix?: string
	theme?: SiteTheme
}

export const ThemeContext = createContext<SiteTheme | null>(null)

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
	// const mergedTheme = useMemo(
	// 	() => mergeTheme(currentTheme, theme),
	// 	[currentTheme, theme]
	// )

	const { themeName, setThemeName } = useThemeName()
	// const mergedTheme = useMemo(() => ({
	// 	...mergeTheme(currentTheme, theme),
	// 	name: (() => themeName)(),
	// 	setName: setThemeName,
	// }), [currentTheme, theme, themeName, setThemeName])

	const mergedData = useMemo(() => mergeTheme(currentTheme, theme), [currentTheme, theme])
	const mergedTheme = useMemo(() => ({
		...mergedData,
		name: themeName,
		setName: setThemeName,
	}), [mergedData, themeName, setThemeName])

	// useEffect(() => {
	// 	if (typeof window === 'undefined') return

	// 	const { documentElement: documentEl } = document,
	// 		rootStyle = getComputedStyle(documentEl),
	// 		cssPrefix = rootStyle.getPropertyValue(PREFIX_CSS_VARS)

	// 	if (!cssPrefix)
	// 		documentEl.style.setProperty(PREFIX_CSS_VARS, PREFIX_CSS_SELECTOR)
	// }, [])

	return <ThemeContext value={ mergedTheme }>{ children }</ThemeContext>
}
