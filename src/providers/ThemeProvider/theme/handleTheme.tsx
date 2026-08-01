import { deepMerge } from '@/utils/helpers/objects'
import type { SiteTheme } from '../theme.types'

interface ThemeValidator {
	(theme: SiteTheme): asserts theme is SiteTheme
}

const validateTheme: ThemeValidator = (theme: SiteTheme) => {
	// if (!(Object.hasOwn(theme, 'font')))
	// 	throw new Error('theme missing font')
}

export const mergeTheme = (current: SiteTheme, override?: SiteTheme) => {
	let theme = current

	if (override) theme = deepMerge(current, override) as SiteTheme
	validateTheme(theme)

	return theme
}
