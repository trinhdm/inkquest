import { buildSchemes } from '@/providers/ThemeProvider/tokens'
import { deepMerge } from '@/utils/helpers'
import type { SiteTheme } from '@/providers/ThemeProvider'

interface ResolveCSSProps {
	current: SiteTheme
	override?: SiteTheme
	prefix?: string
}

export const resolveCssVars = ({ current, override, prefix }: ResolveCSSProps) => {
	const currentVars = buildSchemes(current, prefix)
	let cssVars = currentVars

	if (override) {
		const overrideVars = buildSchemes(override, prefix)
		cssVars = deepMerge(currentVars, overrideVars)
	}

	return cssVars
}
