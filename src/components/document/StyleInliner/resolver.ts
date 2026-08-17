import { buildSchemes, type SiteTheme } from '@/lib/theme'
import { deepMerge } from '@/utils/helpers'

interface ResolveCSSProps {
	current: SiteTheme
	override?: SiteTheme
	prefix?: string
}

export const resolveStyles = ({ current, override, prefix }: ResolveCSSProps) => {
	const currentVars = buildSchemes(current, prefix)
	let cssVars = currentVars

	if (override) {
		const overrideVars = buildSchemes(override, prefix)
		cssVars = deepMerge(currentVars, overrideVars)
	}

	return cssVars
}
