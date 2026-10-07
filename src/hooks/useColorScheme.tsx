'use client'

import { useCallback, useState } from 'react'
import { schemeControls } from '@/components/document/ScriptInjector/schemeControls'
import type { ColorScheme } from '@/lib/theme/types'

const {
	applyScheme, persistScheme,
	getAltScheme, getStoredScheme,
} = schemeControls()

export const useColorScheme = () => {
	const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getStoredScheme)
	const altScheme = getAltScheme(colorScheme)

	const setColorScheme = useCallback((scheme: ColorScheme) => {
		setColorSchemeState(scheme)
		applyScheme(scheme)
		persistScheme(scheme)
	}, [])

	return { altScheme, colorScheme, setColorScheme }
}
