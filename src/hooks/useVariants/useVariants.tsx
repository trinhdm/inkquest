'use client'

import { useInsertionEffect } from 'react'
import { useTheme } from '@/providers/ThemeProvider'
import { deriveVariants } from '@/lib/theme/deriveVariants'
import { hasInjectVariant, markInjectVariant } from './variantsRegistry'
import { serializeStyles } from '@/components/document'

export const useVariants = (name: string) => {
	const theme = useTheme()

	useInsertionEffect(() => {
		if (hasInjectVariant(name)) return

		const variants = deriveVariants({ name }, theme),
			styles = serializeStyles([variants]) ?? undefined

		if (!styles) return
		markInjectVariant(name)

		const stylesheet = document.createElement('style')
		stylesheet.dataset.targetVars = name
		stylesheet.textContent = styles

		document.head.appendChild(stylesheet)
	}, [name])
}
