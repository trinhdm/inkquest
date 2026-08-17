'use client'

import { useInsertionEffect } from 'react'
import { buildVariantSchemes } from '@/lib/theme/buildVariantSchemes'
import { serializeStyles } from '@/components/document'

const registered = new Set<string>()

export const useVariantStyles = (name: string) => {
	useInsertionEffect(() => {
		if (registered.has(name)) return

		if (document.querySelector(`[data-variant-vars="${name}"]`)) {
			registered.add(name)
			return
		}

		registered.add(name)

		const css = serializeStyles(buildVariantSchemes(name))
		if (!css) return

		const style = document.createElement('style')
		style.dataset.variantVars = name
		style.textContent = css
		document.head.appendChild(style)
	}, [name])
}
