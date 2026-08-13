import { deepMerge } from '@/utils/helpers'
import { themeToCssVars } from '../convert'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { SiteTheme } from '@/providers/ThemeProvider'
import { buildSchemes } from '@/providers/ThemeProvider/colors/tokens'

export const resolveCssVars = (
	current: SiteTheme,
	override?: SiteTheme
) => {
	// const currentVars = themeToCssVars(current, PREFIX_CSS_SELECTOR)
	const currentVars = buildSchemes(current, PREFIX_CSS_SELECTOR)
	let cssVars = currentVars
	console.log({ resolve: buildSchemes(current, PREFIX_CSS_SELECTOR), old: currentVars })
	// const test = buildSchemes(current, PREFIX_CSS_SELECTOR)

	if (override) {
		const overrideVars = themeToCssVars(override)
		cssVars = deepMerge(currentVars, overrideVars)
	}

	return cssVars
}
