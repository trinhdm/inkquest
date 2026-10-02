'use client'

import { useCallback, useState } from 'react'
import { schemeControls } from '@/components/document/ScriptInjector/schemeControls'
import type { ColorScheme } from '@/lib/theme/types'

const { applyScheme, getAltScheme, getStoredScheme, persistScheme } = schemeControls()

export const useColorScheme = () => {
	const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getStoredScheme)
	const [altScheme, setAltSchemeState] = useState<ColorScheme>(() => getAltScheme(colorScheme))

	const setColorScheme = useCallback((scheme: ColorScheme) => {
		setColorSchemeState(scheme)
		setAltSchemeState(scheme)
		applyScheme(scheme)
		persistScheme(scheme)
	}, [])

	return { altScheme, colorScheme, setColorScheme }
}
