import { enumerateVariantPalettes } from './tokens/variants'
import { tokenGenerator } from './generate'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { CssRule } from './types'

export const buildVariantSchemes = (name: string): CssRule[] => {
	const namespace = name.toLowerCase(),
		rootClass = `${PREFIX_CSS_SELECTOR}-${name}`,
		palettes = enumerateVariantPalettes()

	return palettes.map(({ palette, priority, variant }) => {
		const dataVariant = `[data-variant="${variant}"]`,
			vars = tokenGenerator(palette, namespace)

		let selector = `.${rootClass}${dataVariant}`
		if (priority) selector += `[data-priority="${priority}"]`

		return { selector, vars }
	})
}
