import { enumerateVariantPalettes } from './tokens/variants'
import { toKebabCase } from '@/utils/helpers'
import { tokenGenerator } from './generate'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { CssRule } from './types'

export const buildVariantSchemes = (name: string): CssRule[] => {
	const namespace = toKebabCase(name),
		rootClass = `${PREFIX_CSS_SELECTOR}-${namespace}`,
		palettes = enumerateVariantPalettes()

	return palettes.map(({ palette, priority, variant }) => {
		const dataVariant = `[data-variant="${variant}"]`,
			vars = tokenGenerator(palette, namespace)

		let selector = `.${rootClass}${dataVariant}`
		if (priority) selector += `[data-priority="${priority}"]`

		return { selector, vars }
	})
}
