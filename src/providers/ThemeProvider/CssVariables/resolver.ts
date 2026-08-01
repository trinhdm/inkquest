import { deepMerge } from '@/utils/helpers'
import { themeToCssVars } from './generator'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { CSSVars } from '@/types/shared'
import type { SiteTheme, ThemeScheme } from '../theme.types'

const BASE_SELECTORS = [':root', ':host'] as const

export const resolveCssVars = (current: SiteTheme, override?: SiteTheme) => {
	const currentVars = themeToCssVars(current, PREFIX_CSS_SELECTOR)
	let cssVars = currentVars

	if (override) {
		const overrideVars = themeToCssVars(override)
		cssVars = deepMerge(currentVars, overrideVars)
	}

	return cssVars
}

const outputCss = (
	input: Record<string, unknown>,
	hasIndent?: boolean
) => {
	const css = Object.entries(input)
		.map(([name, value]) => {
			const declaration = `${name}: ${value};`
			return hasIndent ? `\t${declaration}` : declaration
		})
		.join(hasIndent ? '\n' : ' ')

	return hasIndent ? `\n${css}\n` : ` ${css} `
}

const outputSelectors = (
	scheme: ThemeScheme | 'general',
	override?: string,
	hasIndent?: boolean
) => {
	const selectors = !!override ? [override] : BASE_SELECTORS,
		attr = scheme === 'general' ? '' : `[data-theme="${scheme}"]`,
		space = hasIndent ? `\n` : ` `

	return selectors.map(selector => `${selector}${attr}`).join(`,${space}`)
}

export const outputCssVars = (
	tokens: Record<ThemeScheme | 'general', CSSVars>,
	selector?: string,
	hasIndent: boolean = true
) => {
	const cssVars = (Object.keys(tokens) as (keyof typeof tokens)[]).map(scheme => {
		const selectors = outputSelectors(scheme, selector, hasIndent),
			css = outputCss(tokens[scheme], hasIndent)

		return `${selectors} {${css}}`
	}).join(`\n\n`)

	return cssVars
}
