import { enumerateVariantPalettes } from './tokens/variants'
import { tokenGenerator } from './generate'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { CSSVars } from '@/types/shared'

export interface VariantScheme {
	selector: string
	vars: CSSVars
}

export const buildVariantSchemes = (name: string): VariantScheme[] => {
	const namespace = name.toLowerCase(),
		rootClass = `${PREFIX_CSS_SELECTOR}-${name}`

	return enumerateVariantPalettes().map(({ variant, priority, palette }) => {
		const vars = tokenGenerator(palette, namespace)
		const state = priority
			? `[data-variant="${variant}"][data-priority="${priority}"]`
			: `[data-variant="${variant}"]`

		return { selector: `.${rootClass}${state}`, vars }
	})
}
