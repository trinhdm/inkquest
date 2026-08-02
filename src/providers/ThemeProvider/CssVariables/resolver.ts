import { deepMerge } from '@/utils/helpers'
import { themeToCssVars } from './tokens'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { SiteTheme } from '../theme.types'

export const resolveCssVars = (
	current: SiteTheme,
	override?: SiteTheme
) => {
	const currentVars = themeToCssVars(current, PREFIX_CSS_SELECTOR)
	let cssVars = currentVars

	if (override) {
		const overrideVars = themeToCssVars(override)
		cssVars = deepMerge(currentVars, overrideVars)
	}

	return cssVars
}
