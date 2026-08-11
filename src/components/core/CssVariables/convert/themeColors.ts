import { deepSetMap, flattenMap } from '@/utils/helpers'
import { getVariable } from '../format'
import type { ColorScheme, SiteTheme } from '@/providers/ThemeProvider'
import type { CSSVars, HexCode } from '@/types/shared'

export interface ThemeOptions {
	prefix?: string
	scheme: ColorScheme
	theme: SiteTheme
}

type Position = `0${number}`

const ALT_SCHEME: Record<ColorScheme, ColorScheme> = {
	brand: 'brand',
	ink: 'paper',
	paper: 'ink',
}

function getStep(value: number): string
function getStep(value: Position): number
function getStep(value: number | Position): number | string {
	if (typeof value === 'number') {
		const i = value + 1
		return i < 10 ? `0${i}` as const : String(i)
	}

	return parseFloat(value) - 1
}

export const getThemeColors = ({
	as = 'hex',
	prefix,
	scheme,
	theme,
}: ThemeOptions & { as?: 'hex' | 'var' }) => {
	if (!Object.hasOwn(theme.colors, scheme)) return {}

	const colors = theme.colors[scheme],
		vars = new Map()

	for (const [index, value] of colors.entries()) {
		const step = getStep(index)

		if (as === 'hex')
			deepSetMap(vars, step, value)

		if (as === 'var') {
			const primary = getVariable({ path: ['color', scheme, step], prefix, value }),
				secondary = getVariable({ path: ['color', ALT_SCHEME[scheme], step], prefix, value })
			deepSetMap(vars, 'primary', `primary-${step}`, `var(${primary})`)
			deepSetMap(vars, 'secondary', `secondary-${step}`, `var(${secondary})`)
		}
	}

	return flattenMap(vars) as CSSVars<HexCode>
}

const _customColor = (
	step: Position,
	path: string[],
	options: ThemeOptions
) => {
	const { prefix, scheme, theme } = options

	const colors = theme.colors[scheme],
		index = getStep(step),
		value = colors[index]

	const variable = getVariable({ path: [...path, step], prefix, value })

	return `var(${variable})`
}

const _primaryColor = (step: Position, options: ThemeOptions) =>
	_customColor(step, ['primary'], options)

const _secondaryColor = (step: Position, options: ThemeOptions) =>
	_customColor(step, ['secondary'], options)

const _tertiaryColor = (step: Position, options: ThemeOptions) =>
	_customColor(step, ['color', 'brand'], options)

export const ThemeColor = {
	main: _primaryColor,
	alt: _secondaryColor,
	accent: _tertiaryColor,
	custom: _customColor,
}
