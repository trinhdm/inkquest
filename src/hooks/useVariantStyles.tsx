'use client'

import { useInsertionEffect } from 'react'
// import { buildVariantSchemes } from '@/lib/theme/buildVariantSchemes'
// import { serializeStyles } from '@/components/document'
import { hasInjectedVariantStyles, markVariantStylesInjected } from '@/lib/registries/variantStyleRegistry'

// import { toKebabCase } from '@/utils/helpers'
// import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
// import type { CssRule } from '@/lib/theme'

export const useVariantStyles = (name: string, css?: string) => {
	useInsertionEffect(() => {
		if (!css || hasInjectedVariantStyles(name)) return

		markVariantStylesInjected(name)

		const stylesheet = document.createElement('style')
		stylesheet.dataset.targetVars = name
		stylesheet.textContent = css
		document.head.appendChild(stylesheet)
	}, [name])
}


// export const useVariantStyles = (name: string) => {
// 	useInsertionEffect(() => {
// 		if (hasInjectedVariantStyles(name)) return

// 		markVariantStylesInjected(name)

// 		const namespace = !!name ? toKebabCase(name) : 'variant',
// 			selector = `.${PREFIX_CSS_SELECTOR}-${namespace}`

// 		// const css = serializeStyles(buildVariantSchemes(name))
// 		const test = {
// 			selector,
// 			vars: {
// 				'--button-background': 'var(--variant-background)',
// 				'--button-background-hover': 'var(--variant-background-hover)',
// 				'--button-border': 'var(--variant-border)',
// 				'--button-border-hover': 'var(--variant-border-hover)',
// 				'--button-color': 'var(--variant-color)',
// 			},
// 		}
// 		const css = serializeStyles([test])
// 		console.log('test', { css })
// 		if (!css) return

// 		const style = document.createElement('style')
// 		style.dataset.targetVars = name
// 		style.textContent = css
// 		console.log(style)
// 		document.head.appendChild(style)
// 	}, [name])
// }
