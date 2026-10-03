import { enumerateVariantPalettes, VARIANT_ORDER } from './tokens/variants'
import { toKebabCase } from '@/utils/helpers'
import { tokenGenerator } from './generate'
import type { CssRule } from './types'

export const buildVariantSchemes = (name?: string, prefix?: string): CssRule[] => {
	const namespace = !!name ? toKebabCase(name) : 'variant',
		rootClass = !!prefix ? `${prefix}-${namespace}` : namespace,
		palettes = enumerateVariantPalettes()

	const targets = new Set()

	return palettes.map(({ palette, priority, tone, variant }) => {
		const selectors = [],
			vars = tokenGenerator(palette, namespace)

		let selector = `[data-variant="${variant}"]`
		if (name) selector = `.${rootClass}${selector}`

		if (!targets.has(selector)) {
			selectors.push(selector)
			targets.add(selector)
		}

		if (priority) {
			selectors.push(`${selector}:is([data-priority="${priority}"])`)
		} else if (variant in VARIANT_ORDER) {
			const list = Object.keys(VARIANT_ORDER).reduce<string[]>((acc, k) => {
				if (k !== variant) acc.push(`[data-variant="${k}"]`)
				return acc
			}, []).join(`, `)

			const order = VARIANT_ORDER[variant as keyof typeof VARIANT_ORDER]
			selectors.push(`[data-priority="${order}"]:is(${list})`)
		}

		if (tone)
			selectors.push(`${selector}:is([data-tone="${tone}"])`)

		return { selector: selectors.join(',\n'), vars }
	})
}
