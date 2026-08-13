import { deepMerge } from '@/utils/helpers'
// import { themeToCssVars } from '../convert'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { SiteTheme } from '@/providers/ThemeProvider'
import { buildSchemes } from '@/providers/ThemeProvider/colors'

export const resolveCssVars = (
	current: SiteTheme,
	override?: SiteTheme
) => {
	const currentVars = buildSchemes(current, PREFIX_CSS_SELECTOR)
	let cssVars = currentVars

	if (override) {
		const overrideVars = buildSchemes(override)
		cssVars = deepMerge(currentVars, overrideVars)
	}

	return cssVars
}
