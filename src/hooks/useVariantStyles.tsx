'use client'

import { useInsertionEffect } from 'react'
import { useTheme } from '@/providers/ThemeProvider'
import { deriveVariants } from '@/lib/theme/deriveVariants'
import { serializeStyles } from '@/components/document'
import { hasInjectedVariantStyles, markVariantStylesInjected } from '@/lib/registries/variantStyleRegistry'

export const useVariantStyles = (name: string) => {
	const theme = useTheme()

	useInsertionEffect(() => {
		if (hasInjectedVariantStyles(name)) return

		const variants = deriveVariants({ name }, theme),
			styles = serializeStyles([variants]) ?? undefined

		if (!styles) return
		markVariantStylesInjected(name)

		const stylesheet = document.createElement('style')
		stylesheet.dataset.targetVars = name
		stylesheet.textContent = styles

		document.head.appendChild(stylesheet)
	}, [name])
}
