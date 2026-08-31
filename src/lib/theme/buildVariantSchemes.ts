import { enumerateVariantPalettes } from './tokens/variants'
import { toKebabCase } from '@/utils/helpers'
import { tokenGenerator } from './generate'
import { markVariantStylesInjected } from '@/lib/registries/variantStyleRegistry'
// import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { CssRule } from './types'

export const buildVariantSchemes = (name?: string, prefix?: string): CssRule[] => {
	const namespace = !!name ? toKebabCase(name) : 'variant',
		rootClass = !!prefix ? `${prefix}-${namespace}` : namespace,
		palettes = enumerateVariantPalettes()

	markVariantStylesInjected(namespace)

	return palettes.map(({ palette, priority, variant }) => {
		const dataVariant = `[data-variant="${variant}"]`,
			vars = tokenGenerator(palette, namespace)

		// if (!name) {
		// 	const baseVars = Object.keys(vars)
		// 	for (const varName of baseVars)
		// 		addVariantVariable(varName)
		// }

		let selector = dataVariant
		if (name) selector = `.${rootClass}${selector}`
		if (priority) selector += `[data-priority="${priority}"]`

		return { selector, vars }
	})
}


// export const getVariantScheme = (name?: string): CssRule[] => {
// 	// const schemeVars = handleVariantVariables()
// 	// console.log({ schemeVars })

// 	const variants = {
// 		// selector,
// 		vars: {
// 			'--button-background': 'var(--variant-background)',
// 			'--button-background-hover': 'var(--variant-background-hover)',
// 			'--button-border': 'var(--variant-border)',
// 			'--button-border-hover': 'var(--variant-border-hover)',
// 			'--button-color': 'var(--variant-color)',
// 		},
// 	}

// 	return variants
// }
