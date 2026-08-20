'use client'

import { useInsertionEffect } from 'react'
import { buildVariantSchemes } from '@/lib/theme/buildVariantSchemes'
import { serializeStyles } from '@/components/document'
import { hasInjectedVariantStyles, markVariantStylesInjected } from '@/lib/registries/variantStyleRegistry'

export const useVariantStyles = (name: string) => {
	useInsertionEffect(() => {
		if (hasInjectedVariantStyles(name)) return

		markVariantStylesInjected(name)

		const css = serializeStyles(buildVariantSchemes(name))
		if (!css) return

		const style = document.createElement('style')
		style.dataset.variantVars = name
		style.textContent = css
		document.head.appendChild(style)
	}, [name])
}
