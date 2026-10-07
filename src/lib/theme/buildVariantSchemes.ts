import { enumerateVariantPalettes, VARIANT_ORDER } from './tokens/variants'
import { toKebabCase } from '@/utils/helpers'
import { tokenGenerator } from './generate'
import type { CssRule } from './types'

export const buildVariantSchemes = (name?: string, prefix?: string): CssRule[] => {
	const namespace = !!name ? toKebabCase(name) : 'variant',
		className = !!prefix ? `${prefix}-${namespace}` : namespace,
		scope = name ? `.${className}` : ''

	const palettes = enumerateVariantPalettes(),
		variants = new Set()

	return palettes.map(({ palette, priority, tone, variant }) => {
		const selectors = [],
			root = `${scope}[data-variant="${variant}"]`

		if (!variants.has(root)) {
			selectors.push(root)
			variants.add(root)
		}

		if (priority) {
			if (!tone) selectors.push(`${root}:is([data-priority="${priority}"])`)
		} else if (variant in VARIANT_ORDER) {
			const list = Object.keys(VARIANT_ORDER).reduce<string[]>((acc, k) => {
				if (k !== variant) acc.push(`[data-variant="${k}"]`)
				return acc
			}, []).join(`, `)

			const order = VARIANT_ORDER[variant as keyof typeof VARIANT_ORDER]
			selectors.push(`${scope}[data-priority="${order}"]:is(${list})`)
		}

		if (tone)
			selectors.push(`${root}:is([data-tone="${tone}"])`)

		return {
			selector: selectors.join(',\n'),
			vars: tokenGenerator(palette, namespace),
		}
	})
}
