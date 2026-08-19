import { buildSchemes, type SiteTheme } from '@/lib/theme'
import { deepMerge } from '@/utils/helpers'
import { SCHEME_STORAGE_KEY } from '../ScriptInjector'
import type { CssRule, ThemeTokens } from '@/lib/theme'

interface ResolveCSSProps {
	current: SiteTheme
	override?: SiteTheme
	prefix?: string
}

const BASE_SELECTORS = ':root, :host'

const listSelectors = (
	scheme: keyof ThemeTokens,
	selector?: string,
	lsKey = SCHEME_STORAGE_KEY,
) => {
	const selectors = (!!selector ? selector : BASE_SELECTORS).split(','),
		attr = scheme === 'base' ? '' : `[data-${lsKey}=\"${scheme}\"]`

	return selectors.map(s => `${s.trim()}${attr}`).join(`, `)
}

export const standardizeRules = (
	tokens: ThemeTokens,
	selector?: string,
): CssRule[] =>
	(Object.keys(tokens) as (keyof ThemeTokens)[])
		.filter(scheme => Object.keys(tokens[scheme]).length)
		.map(scheme => ({
			selector: listSelectors(scheme, selector),
			vars: tokens[scheme],
		}))

export const resolveStyles = ({ current, override, prefix }: ResolveCSSProps) => {
	const currentVars = buildSchemes(current, prefix)
	let cssVars = currentVars

	if (override) {
		const overrideVars = buildSchemes(override, prefix)
		cssVars = deepMerge(currentVars, overrideVars)
	}

	return standardizeRules(cssVars)
}
