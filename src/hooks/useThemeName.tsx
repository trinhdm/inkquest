'use client'

import { useCallback, useState } from 'react'
import { themeControls } from '@/components/core/ScriptInjector'
import type { ThemeName } from '@/lib/theme'

const { applyTheme, getStoredTheme, persistTheme } = themeControls()

export const useThemeName = () => {
	const [themeName, setThemeNameState] = useState<ThemeName>(getStoredTheme)

	const setThemeName = useCallback((theme: ThemeName) => {
		setThemeNameState(theme)
		applyTheme(theme)
		persistTheme(theme)
	}, [])

	return { themeName, setThemeName }
}
