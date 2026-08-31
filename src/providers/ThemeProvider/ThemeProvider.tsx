'use client'

import { use, useMemo, type ReactNode } from 'react'
import { handleTheme, mergeTheme } from './theme'
import { ThemeContext } from './theme.context'
import { DEFAULT_THEME } from './constants'
import type { SiteTheme, SiteThemeConfig } from '@/lib/theme'

interface ThemeProviderProps {
	children?: ReactNode
	prefix?: string
	theme?: Partial<SiteTheme>
}

const useThemeConfig = () => {
	const ctx = use(ThemeContext)
	if (!ctx) return DEFAULT_THEME
	return ctx.config
}

// const useSafeTheme = () => use(ThemeContext) || DEFAULT_THEME
export const useTheme = () => {
	const ctx = use(ThemeContext)
	if (!ctx) throw new Error('missing ThemeProvider')

	const { config, ...theme } = ctx
	return theme
}

export const ThemeProvider = ({
	children,
	prefix,
	theme,
}: ThemeProviderProps) => {
	const currentTheme = useThemeConfig()
	const themeConfig = useMemo(() => {
		const mergedTheme = mergeTheme(currentTheme, theme)
		return handleTheme(mergedTheme, prefix)
	}, [currentTheme, prefix, theme])

	return <ThemeContext value={ themeConfig }>{ children }</ThemeContext>
}
