import { getVariable } from '../format'
import type { ColorScheme, SiteTheme } from '@/providers/ThemeProvider'
import type { CSSVars, HexCode } from '@/types/shared'

export interface ThemeColorsConfig {
	prefix?: string
	scheme: ColorScheme
	theme: SiteTheme
}

const ALT_SCHEME: Record<ColorScheme, ColorScheme> = {
	brand: 'brand',
	ink: 'paper',
	paper: 'ink',
}

const _mainColor = (
	step: `0${number}`,
	options: ThemeColorsConfig
) => {
	const { prefix, scheme, theme } = options

	const colors = theme.colors[scheme],
		index = parseFloat(step) - 1,
		value = colors[index]

	// const path = scheme === 'ink' ? 'primary' : 'secondary'
	const variable = getVariable({ path: ['color', scheme, step], prefix, value })

	return `var(${variable})`
}

const _altColor = (step: `0${number}`, options: ThemeColorsConfig) =>
	_mainColor(step, { ...options, scheme: ALT_SCHEME[options.scheme] })

const _accentColor = (step: `0${number}`, options: ThemeColorsConfig) =>
	_mainColor(step, { ...options, scheme: 'brand' })

export const ThemeColor = {
	main: _mainColor,
	alt: _altColor,
	accent: _accentColor,
}

export const getThemeColors = ({
	as = 'hex',
	prefix,
	scheme,
	theme,
}: ThemeColorsConfig & { as?: 'hex' | 'var' }) => {
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
