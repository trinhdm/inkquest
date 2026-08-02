import { getVariable } from './formatters'
import type { CSSVars, HexCode } from '@/types/shared'
import type { ColorScheme, SiteTheme } from '../theme.types'

export interface ThemeColorsConfig {
	prefix?: string
	scheme: ColorScheme
	theme: SiteTheme
}

export const ThemeColor = (() => {
	const altSchemes = {
		brand: 'brand',
		ink: 'paper',
		paper: 'ink',
	} as Record<ThemeColorsConfig['scheme'], ThemeColorsConfig['scheme']>

	return {
		main: function (
			step: `0${number}`,
			options: ThemeColorsConfig
		) {
			const { prefix, scheme, theme } = options

			const colors = theme.colors[scheme],
				index = parseFloat(step) - 1,
				value = colors[index]

			const variable = getVariable({ path: ['color', scheme, step], prefix, value })

			return `var(${variable})`
		},
		alt: function (
			step: `0${number}`,
			options: ThemeColorsConfig
		) {
			const args = { ...options, scheme: altSchemes[options.scheme] }
			return this.main(step, args)
		},
		accent: function (
			step: `0${number}`,
			options: ThemeColorsConfig
		) {
			const args = { ...options, scheme: 'brand' as ThemeColorsConfig['scheme'] }
			return this.main(step, args)
		},
	}
})()

export const getThemeColors = ({
	as = 'hex',
	prefix,
	scheme,
	theme,
}: ThemeColorsConfig & {
	as?: 'hex' | 'var'
}) => {
	if (!Object.hasOwn(theme.colors, scheme)) return {}

	const colors = theme.colors[scheme],
		vars = {}

	for (const [index, value] of colors.entries()) {
		const i = index + 1,
			step = i < 10 ? `0${i}` : String(i),
			variable = getVariable({ path: ['color', scheme, step], prefix, value }),
			color = as === 'hex' ? value : `var(${variable})`

		Object.assign(vars, { [step]: color })
	}

	return vars as CSSVars<HexCode>
}
