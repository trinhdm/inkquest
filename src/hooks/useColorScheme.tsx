'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { schemeControls } from '@/components/document/ScriptInjector/schemeControls'
import { DEFAULT_COLOR_SCHEME } from '@/components/document/constants'
import type { ColorScheme } from '@/lib/theme/types'

const {
	applyScheme, persistScheme,
	getAltScheme, getStoredScheme,
} = schemeControls()

//	rereads scheme whenever an attribute on <html> changes
const subscribe = (onChange: () => void) => {
	const observer = new MutationObserver(onChange)
	observer.observe(document.documentElement, { attributes: true })
	return () => observer.disconnect()
}

export const useColorScheme = () => {
	const colorScheme = useSyncExternalStore<ColorScheme>(subscribe, getStoredScheme, () => DEFAULT_COLOR_SCHEME)
	const altScheme = getAltScheme(colorScheme)

	const setColorScheme = useCallback((scheme: ColorScheme) => {
		applyScheme(scheme)
		persistScheme(scheme)
	}, [])

	return { altScheme, colorScheme, setColorScheme }
}
