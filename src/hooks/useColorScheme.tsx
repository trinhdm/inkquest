'use client'

import { useCallback, useState } from 'react'
import { schemeControls } from '@/components/document'
import type { ColorScheme } from '@/lib/theme'

const { applyScheme, getStoredScheme, persistScheme } = schemeControls()

export const useColorScheme = () => {
	const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getStoredScheme)

	const setColorScheme = useCallback((scheme: ColorScheme) => {
		setColorSchemeState(scheme)
		applyScheme(scheme)
		persistScheme(scheme)
	}, [])

	return { colorScheme, setColorScheme }
}
