'use client'

import { useCallback, useState } from 'react'
import { applyTheme, getStoredTheme, persistTheme } from '@/providers/ThemeProvider/SchemeScript/applyTheme'
import type { ThemeName } from '@/providers/ThemeProvider/theme.types'

export const useThemeName = () => {
	const [themeName, setThemeNameState] = useState<ThemeName>(getStoredTheme)

	const setThemeName = useCallback((theme: ThemeName) => {
		setThemeNameState(theme)
		applyTheme(theme)
		persistTheme(theme)
	}, [])

	return { themeName, setThemeName }
}
